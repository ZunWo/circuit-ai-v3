const environment = import.meta.env ?? {};
const threshold = Number(environment.VITE_AI_CONFIDENCE_THRESHOLD ?? 0.7);

// Explicit aliases approved for the user's mZNDylZHP model. No fuzzy matching.
export const modelLabelAliases = Object.freeze({
  resistor: "Resistor",
  c_ceramic: "C Ceramic",
  c_film: "C Film",
  c_electrolyte: "C Electrolytic",
  diode: "Diode",
  transistor: "Transistor",
  led: "LED",
  switch: "Switch",
  ldr: "Photoresistor",
  "7segment": "7-Segment",
  potentiometer: "Potentiometer",
  buzzer: "Buzzer",
  thermistor: "Thermistor",
  phototransistor: "IR LED / Photo transistor",
});

// User confirmed this class contains Photo transistor training images only.
export const modelCoverageNotes = Object.freeze({
  phototransistor:
    "โมเดลนี้ฝึกเฉพาะ Photo transistor ในหมวด IR LED / Photo transistor จึงยังไม่รองรับการจำแนก IR LED",
});

export const aiConfig = Object.freeze({
  modelUrl: String(
    environment.VITE_TM_MODEL_URL ??
      "https://teachablemachine.withgoogle.com/models/mZNDylZHP/",
  ).trim(),
  confidenceThreshold:
    Number.isFinite(threshold) && threshold >= 0 && threshold <= 1
      ? threshold
      : 0.7,
  maxImageBytes: 10 * 1024 * 1024,
  imageTypes: ["image/jpeg", "image/png", "image/webp"],
});
