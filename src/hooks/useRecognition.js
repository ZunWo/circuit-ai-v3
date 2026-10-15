import { useCallback, useEffect, useRef, useState } from "react";
import { aiConfig } from "../config/aiConfig.js";
import { mockPredictions } from "../data/mockPredictions.js";
import {
  formatPredictions,
  loadModel,
  predictImage,
  readableError,
  getModelCoverageNotes,
} from "../services/teachableMachine.js";
import { decodeImage } from "../services/image.js";

export function useRecognition() {
  const [modelState, setModelState] = useState({
    status: aiConfig.modelUrl ? "loading" : "not-configured",
    error: "",
  });
  const [predictionState, setPredictionState] = useState({
    status: "idle",
    result: null,
    error: "",
  });
  const [loadAttempt, setLoadAttempt] = useState(0);
  const modelRef = useRef(null);
  const mountedRef = useRef(false);
  const requestId = useRef(0);
  const busyRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestId.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!aiConfig.modelUrl) return;
    let active = true;
    setModelState({ status: "loading", error: "" });
    loadModel(aiConfig.modelUrl)
      .then((model) => {
        if (!active) return;
        modelRef.current = model;
        setModelState({
          status: "ready",
          error: "",
          coverageNotes: getModelCoverageNotes(model.getClassLabels()),
        });
      })
      .catch((error) => {
        if (active)
          setModelState({
            status: "error",
            error: readableError(error, "โหลดโมเดลไม่สำเร็จ"),
          });
      });
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const resetPrediction = useCallback(() => {
    requestId.current += 1;
    setPredictionState({ status: "idle", result: null, error: "" });
  }, []);

  const analyze = useCallback(
    async (upload) => {
      if (
        busyRef.current ||
        !upload ||
        !modelRef.current ||
        modelState.status !== "ready"
      )
        return;
      busyRef.current = true;
      const id = ++requestId.current;
      setPredictionState({ status: "analyzing", result: null, error: "" });
      try {
        const image = await decodeImage(upload.url);
        const result = await predictImage(modelRef.current, image);
        if (mountedRef.current && id === requestId.current)
          setPredictionState({ status: "completed", result, error: "" });
      } catch (error) {
        if (mountedRef.current && id === requestId.current)
          setPredictionState({
            status: "error",
            result: null,
            error: readableError(error, "วิเคราะห์ภาพไม่สำเร็จ"),
          });
      } finally {
        busyRef.current = false;
      }
    },
    [modelState.status],
  );

  const showDemo = useCallback(() => {
    if (busyRef.current) return;
    requestId.current += 1;
    setPredictionState({
      status: "completed",
      result: formatPredictions(mockPredictions, "demo"),
      error: "",
    });
  }, []);

  return {
    modelState,
    predictionState,
    analyze,
    showDemo,
    resetPrediction,
    retryModel: () => setLoadAttempt((attempt) => attempt + 1),
  };
}
