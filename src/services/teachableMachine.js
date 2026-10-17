import { componentByLabel, expectedLabels } from "../data/components.js";
import { aiConfig, modelLabelAliases, modelCoverageNotes } from "../config/aiConfig.js";

const modelLoads = new Map();
const modelLoadProgress = new Map();

function disposeModel(model) {
  if (!model) return;
  try {
    model.dispose?.();
  } catch {
    // TM 0.8.5 dispose refers to truncatedModel, absent on some exported models.
    // Dispose its loaded LayersModel when that library implementation fails.
    try {
      model.model?.dispose?.();
    } catch {
      /* An already-disposed model needs no cleanup. */
    }
  }
}

export function normalizeModelUrl(value) {
  if (!value || !value.trim()) return "";
  const input = value.trim();
  if (!input.startsWith("/") && !/^https?:\/\//i.test(input)) {
    throw new Error(
      "Model URL ต้องเป็น http(s) URL หรือพาธภายในเว็บไซต์ เช่น /models/my-model/",
    );
  }
  const base =
    typeof window === "undefined"
      ? "http://localhost/"
      : window.location.origin;
  const url = new URL(input, base);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error("Model URL ไม่ถูกต้องหรือมีข้อมูลเข้าสู่ระบบ");
  }
  if (url.search || url.hash)
    throw new Error("ใช้ URL ของโฟลเดอร์โมเดลที่ไม่มี query หรือ fragment");
  url.pathname = url.pathname.replace(/\/(model|metadata)\.json$/i, "/");
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url.href;
}

export function resolveModelLabel(label) {
  return Object.hasOwn(modelLabelAliases, label)
    ? modelLabelAliases[label]
    : label;
}

export function getModelCoverageNotes(labels) {
  return labels
    .filter((label) => Object.hasOwn(modelCoverageNotes, label))
    .map((label) => modelCoverageNotes[label]);
}

export function validateLabels(labels) {
  if (
    !Array.isArray(labels) ||
    labels.some((label) => typeof label !== "string")
  ) {
    throw new Error("metadata ของโมเดลไม่มีชื่อคลาสที่ถูกต้อง");
  }
  const mappedLabels = labels.map(resolveModelLabel);
  const missing = expectedLabels.filter(
    (label) => !mappedLabels.includes(label),
  );
  const unexpected = [
    ...new Set(
      labels.filter((label) => !componentByLabel.has(resolveModelLabel(label))),
    ),
  ];
  const duplicates = [
    ...new Set(
      mappedLabels.filter(
        (label, index) => mappedLabels.indexOf(label) !== index,
      ),
    ),
  ];
  const errors = [];
  if (missing.length) errors.push(`ขาด: ${missing.join(", ")}`);
  if (unexpected.length) errors.push(`ไม่รองรับ: ${unexpected.join(", ")}`);
  if (duplicates.length) errors.push(`ซ้ำ: ${duplicates.join(", ")}`);
  if (labels.length !== expectedLabels.length)
    errors.push(`ต้องมี 14 คลาส แต่พบ ${labels.length}`);
  if (errors.length)
    throw new Error(`ชื่อคลาสโมเดลไม่ตรงกับ CircuitLib — ${errors.join(" • ")}`);
  return true;
}

export function formatPredictions(predictions, source = "real") {
  if (!["real", "demo"].includes(source))
    throw new Error("ไม่รู้จักแหล่งที่มาของผลลัพธ์");
  if (!Array.isArray(predictions)) throw new Error("โมเดลส่งผลลัพธ์ไม่ถูกต้อง");
  validateLabels(predictions.map((prediction) => prediction.className));
  const ranked = predictions
    .map(({ className: modelClassName, probability }) => {
      const className = resolveModelLabel(modelClassName);
      if (
        typeof probability !== "number" ||
        !Number.isFinite(probability) ||
        probability < 0 ||
        probability > 1
      ) {
        throw new Error(`คะแนนของ ${className} ไม่ถูกต้อง`);
      }
      return {
        className,
        modelClassName,
        coverageNote: Object.hasOwn(modelCoverageNotes, modelClassName)
          ? modelCoverageNotes[modelClassName]
          : "",
        probability,
        percentage: probability * 100,
        component: componentByLabel.get(className),
      };
    })
    .sort((a, b) => b.probability - a.probability);
  // Preserve the model's probabilities; only convert to percentages for presentation.
  const sum = ranked.reduce(
    (total, prediction) => total + prediction.probability,
    0,
  );
  if (Math.abs(sum - 1) > 0.02)
    throw new Error("ผลโมเดลไม่ได้เป็น probability distribution ที่ถูกต้อง");
  return { source, predictions: ranked, top: ranked[0] };
}

export function readableError(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

export async function loadModel(modelUrl, onProgress) {
  const baseUrl = normalizeModelUrl(modelUrl);
  if (!baseUrl) throw new Error("ยังไม่ได้กำหนด VITE_TM_MODEL_URL");
  let promise = modelLoads.get(baseUrl);
  let progress = modelLoadProgress.get(baseUrl);
  if (!promise) {
    progress = { value: 0, listeners: new Set() };
    modelLoadProgress.set(baseUrl, progress);
    const report = (value) => {
      if (!Number.isFinite(value)) return;
      progress.value = Math.max(progress.value, Math.min(100, Math.round(value)));
      for (const listener of progress.listeners) listener(progress.value);
    };
    promise = (async () => {
      const tf = await import("@tensorflow/tfjs");
      const tmImage = await import("@teachablemachine/image");
      const load = tmImage.load ?? tmImage.default?.load;
      if (typeof load !== "function")
        throw new Error("ไม่สามารถเริ่ม Teachable Machine library ได้");
      let model;
      try {
        // Adapted from CircuitLib: report actual TF.js download progress.
        const modelFile = tf.io.http(baseUrl + "model.json", {
          onProgress: (fraction) => report(fraction * 100),
        });
        model = await load(modelFile, baseUrl + "metadata.json");
        validateLabels(model.getClassLabels());
        if (model.getTotalClasses() !== expectedLabels.length)
          throw new Error("จำนวน output ของโมเดลต้องเท่ากับ 14");
        report(100);
        return model;
      } catch (error) {
        disposeModel(model);
        throw new Error(
          "โหลดโมเดลไม่สำเร็จ: " + readableError(error, "ตรวจ URL และไฟล์โมเดล") +
          " ตรวจ model.json, metadata.json, weights และ CORS ของที่เก็บโมเดล",
        );
      }
    })();
    modelLoads.set(baseUrl, promise);
  }
  if (typeof onProgress === "function") {
    progress.listeners.add(onProgress);
    onProgress(progress.value);
  }
  try {
    return await promise;
  } catch (error) {
    if (modelLoads.get(baseUrl) === promise) {
      modelLoads.delete(baseUrl);
      modelLoadProgress.delete(baseUrl);
    }
    throw error;
  } finally {
    progress.listeners.delete(onProgress);
  }
}

export const lowConfidenceMessage =
  "ไม่สามารถวิเคราะห์ได้ เกิดข้อผิดพลาด กรุณาเช็คแสงและความชัดเจนของรูปภาพ";

export function isConfidentPrediction(result) {
  return (
    Number.isFinite(result?.top?.probability) &&
    result.top.probability > aiConfig.confidenceThreshold
  );
}

export async function predictImage(model, imageElement) {
  if (!model || typeof model.predict !== "function")
    throw new Error("โมเดลยังไม่พร้อม");
  if (!imageElement?.complete || !imageElement.naturalWidth)
    throw new Error("ภาพยังถอดรหัสไม่สำเร็จ");
  const predictions = await model.predict(imageElement);
  const result = formatPredictions(predictions, "real");
  if (!isConfidentPrediction(result)) throw new Error(lowConfidenceMessage);
  return result;
}

// The application owns cached models for its lifetime; dispose them on a Vite HMR update.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    for (const promise of modelLoads.values())
      promise.then(disposeModel).catch(() => {});
    modelLoads.clear();
    modelLoadProgress.clear();
  });
}
