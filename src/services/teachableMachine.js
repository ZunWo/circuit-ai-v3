import { componentByLabel, expectedLabels } from "../data/components.js";
import { modelLabelAliases, modelCoverageNotes } from "../config/aiConfig.js";

const modelLoads = new Map();

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
    throw new Error(`ชื่อคลาสโมเดลไม่ตรงกับ CircuitAI — ${errors.join(" • ")}`);
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

export async function loadModel(modelUrl) {
  const baseUrl = normalizeModelUrl(modelUrl);
  if (!baseUrl) throw new Error("ยังไม่ได้กำหนด VITE_TM_MODEL_URL");
  if (modelLoads.has(baseUrl)) return modelLoads.get(baseUrl);
  // Cache the promise as well as the model: Strict Mode cannot start duplicate downloads.
  const promise = (async () => {
    await import("@tensorflow/tfjs");
    const tmImage = await import("@teachablemachine/image");
    const load = tmImage.load ?? tmImage.default?.load;
    if (typeof load !== "function")
      throw new Error("ไม่สามารถเริ่ม Teachable Machine library ได้");
    let model;
    try {
      model = await load(`${baseUrl}model.json`, `${baseUrl}metadata.json`);
      validateLabels(model.getClassLabels());
      if (model.getTotalClasses() !== expectedLabels.length)
        throw new Error("จำนวน output ของโมเดลต้องเท่ากับ 14");
      return model;
    } catch (error) {
      disposeModel(model);
      throw new Error(
        `โหลดโมเดลไม่สำเร็จ: ${readableError(error, "ตรวจ URL และไฟล์โมเดล")} ตรวจ model.json, metadata.json, weights และ CORS ของที่เก็บโมเดล`,
      );
    }
  })();
  modelLoads.set(baseUrl, promise);
  try {
    return await promise;
  } catch (error) {
    modelLoads.delete(baseUrl);
    throw error;
  }
}

export async function predictImage(model, imageElement) {
  if (!model || typeof model.predict !== "function")
    throw new Error("โมเดลยังไม่พร้อม");
  if (!imageElement?.complete || !imageElement.naturalWidth)
    throw new Error("ภาพยังถอดรหัสไม่สำเร็จ");
  const predictions = await model.predict(imageElement);
  return formatPredictions(predictions, "real");
}

// The application owns cached models for its lifetime; dispose them on a Vite HMR update.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    for (const promise of modelLoads.values())
      promise.then(disposeModel).catch(() => {});
    modelLoads.clear();
  });
}
