import test from "node:test";
import assert from "node:assert/strict";
import { components, expectedLabels } from "../src/data/components.js";
import { equipment } from "../src/data/equipment.js";
import { mockPredictions } from "../src/data/mockPredictions.js";
import { aiConfig } from "../src/config/aiConfig.js";
import { validateImageFile } from "../src/services/image.js";
import {
  formatPredictions,
  loadModel,
  normalizeModelUrl,
  predictImage,
  validateLabels,
  getModelCoverageNotes,
} from "../src/services/teachableMachine.js";

// These tests exercise contracts with explicit fixtures, not a trained recognition model.
test("dataset has exactly 14 unique labels, independent IDs and all educational fields", () => {
  assert.equal(components.length, 14);
  assert.equal(new Set(expectedLabels).size, 14);
  assert.equal(new Set(components.map((component) => component.id)).size, 14);
  assert.ok(expectedLabels.includes("IR LED / Photo transistor"));
  for (const component of components) {
    for (const key of [
      "id",
      "name",
      "thaiName",
      "classificationLabel",
      "description",
      "function",
      "principle",
      "identification",
    ])
      assert.ok(component[key]);
    assert.ok(component.applications.length);
    assert.notEqual(component.id, component.classificationLabel);
  }
  assert.equal(equipment.length, 4);
  for (const instrument of equipment) {
    assert.ok(!expectedLabels.includes(instrument.name));
    assert.ok(instrument.steps.length >= 5 && instrument.steps.length <= 7);
    assert.ok(instrument.safety.length);
  }
});

test("class validation accepts reordered classes and rejects missing, extra and duplicate names", () => {
  assert.equal(validateLabels([...expectedLabels].reverse()), true);
  assert.throws(() => validateLabels(expectedLabels.slice(1)), /ขาด: Resistor/);
  assert.throws(
    () => validateLabels([...expectedLabels, "Unknown"]),
    /ไม่รองรับ: Unknown/,
  );
  assert.throws(
    () => validateLabels([...expectedLabels.slice(1), "LED"]),
    /ซ้ำ: LED/,
  );
  assert.throws(
    () =>
      validateLabels(
        expectedLabels.map((label) =>
          label === "Resistor" ? "RESISTOR" : label,
        ),
      ),
    /ไม่รองรับ: RESISTOR/,
  );
});

const providedModelLabels = [
  "resistor",
  "c_ceramic",
  "c_film",
  "c_electrolyte",
  "diode",
  "transistor",
  "led",
  "switch",
  "ldr",
  "7segment",
  "potentiometer",
  "buzzer",
  "thermistor",
  "phototransistor",
];

test("approved model aliases map to all website categories and detect alias collisions", () => {
  assert.equal(validateLabels(providedModelLabels), true);
  assert.equal(validateLabels([...providedModelLabels].reverse()), true);
  assert.throws(
    () => validateLabels([...providedModelLabels.slice(0, -1), "Resistor"]),
    /ซ้ำ: Resistor/,
  );
  assert.throws(
    () =>
      validateLabels(
        providedModelLabels.map((label) =>
          label === "ldr" ? "photo_resistor" : label,
        ),
      ),
    /ไม่รองรับ: photo_resistor/,
  );
});

test("alias prediction preserves raw values and reports limited Photo transistor training coverage", () => {
  const probabilities = providedModelLabels.map((className) => ({
    className,
    probability: className === "phototransistor" ? 0.87 : 0.13 / 13,
  }));
  const result = formatPredictions(probabilities);
  assert.equal(result.top.className, "IR LED / Photo transistor");
  assert.equal(result.top.modelClassName, "phototransistor");
  assert.equal(result.top.component.id, "ir-led-photo-transistor");
  assert.equal(result.top.probability, 0.87);
  assert.match(result.top.coverageNote, /ยังไม่รองรับการจำแนก IR LED/);
  assert.equal(getModelCoverageNotes(providedModelLabels).length, 1);
  assert.deepEqual(getModelCoverageNotes(expectedLabels), []);
});

test("URL supports hosted directories, model.json and local model assets", () => {
  assert.equal(
    normalizeModelUrl(" https://example.com/model "),
    "https://example.com/model/",
  );
  assert.equal(
    normalizeModelUrl("https://example.com/model/model.json"),
    "https://example.com/model/",
  );
  assert.equal(
    normalizeModelUrl("/models/my-model/"),
    "http://localhost/models/my-model/",
  );
  assert.equal(normalizeModelUrl(""), "");
  for (const url of [
    "javascript:alert(1)",
    "file:///model/",
    "https://user:password@example.com/",
    "https://example.com/?key=value",
  ])
    assert.throws(() => normalizeModelUrl(url));
});

test("formatting sorts by probability, maps by name and preserves model numbers", () => {
  const result = formatPredictions([...mockPredictions].reverse(), "demo");
  assert.equal(result.source, "demo");
  assert.equal(result.top.className, "Resistor");
  assert.equal(result.top.component.id, "resistor");
  assert.equal(result.top.probability, 0.94);
  assert.equal(result.top.percentage, 94);
  for (let index = 1; index < result.predictions.length; index++)
    assert.ok(
      result.predictions[index - 1].probability >=
        result.predictions[index].probability,
    );
  assert.equal(aiConfig.confidenceThreshold, 0.7);
});

test("formatting rejects invalid probability values and distributions", () => {
  for (const probability of [NaN, Infinity, -0.1, 1.1, "0.94"]) {
    assert.throws(
      () =>
        formatPredictions(
          mockPredictions.map((prediction, index) =>
            index === 0 ? { ...prediction, probability } : prediction,
          ),
        ),
      /คะแนน/,
    );
  }
  assert.throws(
    () =>
      formatPredictions(
        mockPredictions.map((prediction) => ({
          ...prediction,
          probability: 0,
        })),
      ),
    /distribution/,
  );
  assert.throws(
    () => formatPredictions(mockPredictions, "unknown"),
    /แหล่งที่มา/,
  );
});

test("low-confidence fixture remains inspectable without inventing an Unknown class", () => {
  const fixture = expectedLabels.map((className) => ({
    className,
    probability: 1 / 14,
  }));
  const result = formatPredictions(fixture);
  assert.ok(result.top.probability < aiConfig.confidenceThreshold);
  assert.equal(result.predictions.length, 14);
  assert.ok(
    !result.predictions.some(
      (prediction) => prediction.className === "Unknown",
    ),
  );
});

test("upload validation enforces MIME, nonempty data and 10 MB limit", () => {
  for (const type of aiConfig.imageTypes)
    assert.equal(validateImageFile({ type, size: 512 }), true);
  assert.equal(
    validateImageFile({ type: "image/png", size: 10 * 1024 * 1024 }),
    true,
  );
  assert.throws(
    () => validateImageFile({ type: "image/png", size: 10 * 1024 * 1024 + 1 }),
    /10 MB/,
  );
  assert.throws(
    () => validateImageFile({ type: "image/svg+xml", size: 512 }),
    /รองรับเฉพาะ/,
  );
  assert.throws(
    () => validateImageFile({ type: "image/png", size: 0 }),
    /ไฟล์ภาพว่าง/,
  );
  assert.throws(() => validateImageFile(null), /เลือกภาพ/);
});

test("missing model cannot load or predict; undecoded image cannot enter prediction", async () => {
  await assert.rejects(loadModel(""), /VITE_TM_MODEL_URL/);
  await assert.rejects(predictImage(null, {}), /โมเดลยังไม่พร้อม/);
  let calls = 0;
  const contractModel = {
    predict: async () => {
      calls++;
      return mockPredictions;
    },
  };
  await assert.rejects(
    predictImage(contractModel, { complete: false, naturalWidth: 1 }),
    /ถอดรหัส/,
  );
  assert.equal(calls, 0);
});

test("prediction errors propagate and service calls predict with the provided decoded image", async () => {
  const decodedImageFixture = { complete: true, naturalWidth: 200 };
  await assert.rejects(
    predictImage(
      {
        predict: async () => {
          throw new Error("test prediction failure");
        },
      },
      decodedImageFixture,
    ),
    /test prediction failure/,
  );
  const contractModel = {
    predict: async (image) => {
      assert.equal(image, decodedImageFixture);
      return mockPredictions;
    },
  };
  const result = await predictImage(contractModel, decodedImageFixture);
  assert.equal(result.source, "real");
  assert.equal(result.top.probability, mockPredictions[0].probability);
});
