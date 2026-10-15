// Browser-only component fixtures. This entry is not imported by the application.
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import PredictionResult from "../../src/components/recognition/PredictionResult.jsx";
import { expectedLabels } from "../../src/data/components.js";
import { formatPredictions } from "../../src/services/teachableMachine.js";

export function mountPredictionHarness() {
  const container = document.createElement("div");
  container.id = "component-test-fixture";
  document.body.appendChild(container);
  const root = createRoot(container);
  const render = (state) =>
    root.render(
      <BrowserRouter>
        <PredictionResult state={state} />
      </BrowserRouter>,
    );
  const lowConfidenceFixture = formatPredictions(
    expectedLabels.map((className) => ({ className, probability: 1 / 14 })),
    "demo",
  );
  return { render, lowConfidenceFixture };
}
