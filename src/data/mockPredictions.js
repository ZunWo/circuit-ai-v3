import { expectedLabels } from "./components.js";

// Deliberate, fixed sample data. This file is never used by the AI service.
export const mockPredictions = expectedLabels.map((className) => ({
  className,
  probability:
    className === "Resistor"
      ? 0.94
      : className === "Thermistor"
        ? 0.035
        : className === "Diode"
          ? 0.013
          : 0.012 / 11,
}));
