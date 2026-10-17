import test from "node:test";
import assert from "node:assert/strict";
import { components, expectedLabels } from "../src/data/components.js";
import { equipment } from "../src/data/equipment.js";
import { connections } from "../src/data/connections.js";
import { buildCircuitLayout, terminalKey } from "../src/services/circuitLayout.js";
import { buildBreadboardLayout, breadboardWireRoute, focusedBreadboardView, endpointLabelBounds } from "../src/services/breadboardLayout.js";
import { mockPredictions } from "../src/data/mockPredictions.js";
import { aiConfig } from "../src/config/aiConfig.js";
import { validateImageFile } from "../src/services/image.js";
import {
  formatPredictions,
  loadModel,
  normalizeModelUrl,
  predictImage,
  isConfidentPrediction,
  lowConfidenceMessage,
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
  "c_electrolytic",
  "diode",
  "transistor",
  "led",
  "button_switch",
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
  // Older exports of the same model remain supported.
  assert.equal(
    validateLabels(
      providedModelLabels.map((label) =>
        label === "c_electrolytic"
          ? "c_electrolyte"
          : label === "button_switch"
            ? "switch"
            : label,
      ),
    ),
    true,
  );
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
  for (const [rawLabel, category] of [
    ["c_electrolytic", "C Electrolytic"],
    ["button_switch", "Switch"],
  ]) {
    const prediction = result.predictions.find(
      ({ modelClassName }) => modelClassName === rawLabel,
    );
    assert.equal(prediction.className, category);
    assert.equal(prediction.component.classificationLabel, category);
    assert.equal(prediction.probability, 0.13 / 13);
  }
  assert.match(result.top.coverageNote, /ยังไม่รองรับการจำแนก IR LED/);
  assert.equal(getModelCoverageNotes(providedModelLabels).length, 1);
  assert.deepEqual(getModelCoverageNotes(expectedLabels), []);
});

test("live shortened class names map exactly, retain coverage notes and still reject collisions", () => {
  const shortened = { c_electrolytic: "c_electrolyt...", phototransistor: "phototransis...",
    button_switch: "button_switc...", potentiometer: "potentiomete..." };
  const labels = providedModelLabels.map(label => shortened[label] ?? label);
  assert.equal(validateLabels(labels), true);
  const result = formatPredictions(labels.map(className => ({ className,
    probability: className === "phototransis..." ? 0.87 : 0.13 / 13 })));
  assert.equal(result.top.className, "IR LED / Photo transistor");
  assert.equal(result.top.modelClassName, "phototransis...");
  assert.equal(result.top.probability, 0.87);
  assert.match(result.top.coverageNote, /ยังไม่รองรับการจำแนก IR LED/);
  assert.equal(getModelCoverageNotes(labels).length, 1);
  assert.equal(result.predictions.find(p => p.modelClassName === "button_switc...").component.id, "switch");
  assert.equal(result.predictions.find(p => p.modelClassName === "potentiomete...").component.id, "potentiometer");
  assert.equal(result.predictions.find(p => p.modelClassName === "c_electrolyt...").component.id, "electrolytic-capacitor");
  assert.throws(() => validateLabels(labels.map(label => label === "c_electrolyt..." ? "c_electrolyt.." : label)), /ไม่รองรับ/);
  assert.throws(() => validateLabels(labels.map(label => label === "thermistor" ? "potentiometer" : label)), /ซ้ำ: Potentiometer/);
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

test("confidence gate rejects 70% and below, while allowing values strictly above 70%", async () => {
  const image = { complete: true, naturalWidth: 224 };
  for (const probability of [0.69, 0.7, 0.70001, 0.94]) {
    const raw = expectedLabels.map((className, index) => ({
      className,
      probability: index === 0 ? probability : (1 - probability) / 13,
    }));
    const formatted = formatPredictions(raw);
    assert.equal(isConfidentPrediction(formatted), probability > 0.7);
    const model = { predict: async () => raw };
    if (probability <= 0.7) {
      await assert.rejects(predictImage(model, image), { message: lowConfidenceMessage });
    } else {
      const result = await predictImage(model, image);
      assert.equal(result.top.className, "Resistor");
      assert.equal(result.top.probability, probability);
    }
  }
  assert.equal(isConfidentPrediction(null), false);
});

test("every component has complete pin-to-pin wiring examples and distinct alternatives", () => {
  assert.deepEqual(Object.keys(connections).sort(), components.map(({ id }) => id).sort());
  for (const component of components) {
    const connection = connections[component.id];
    assert.ok(connection.title);
    assert.ok(connection.note);
    assert.ok(connection.examples.length > 0);
    const ids = connection.examples.map(({ id }) => id);
    assert.equal(new Set(ids).size, ids.length);
    for (const example of connection.examples) {
      assert.ok(example.parts.length > 0);
      assert.ok(example.setup);
      assert.ok(example.outcome);
      assert.ok(example.wires.length >= 2);
      for (const wire of example.wires) {
        assert.ok(wire.from.part && wire.from.pin);
        assert.ok(wire.to.part && wire.to.pin);
        assert.ok(["power", "ground", "signal"].includes(wire.type));
      }
    }
  }
});

test("connection pictures preserve every wire and keep all terminal positions inside the image", () => {
  for (const connection of Object.values(connections)) {
    for (const example of connection.examples) {
      const layout = buildCircuitLayout(example);
      assert.equal(layout.wires.length, example.wires.length);
      for (const wire of layout.wires) {
        for (const pin of [wire.from, wire.to]) {
          assert.ok(Number.isFinite(pin.x) && Number.isFinite(pin.y));
          assert.ok(pin.x >= 0 && pin.x <= layout.width);
          assert.ok(pin.y >= 0 && pin.y <= layout.height);
        }
      }
      assert.ok(layout.nodes.length > 0);
    }
  }
});

test("picture terminals share a collector sensing junction without treating GPIO as a power rail", () => {
  const example = connections["ir-led-photo-transistor"].examples[0];
  const layout = buildCircuitLayout(example);
  assert.equal(layout.wires[1].to, layout.wires[2].from);
  assert.equal(
    terminalKey({ part: "Photo transistor", pin: "Collector (C)" }),
    terminalKey({ part: "Photo transistor", pin: "Collector (C) / จุดอ่าน" }),
  );
  assert.ok(!terminalKey({ part: "บอร์ด", pin: "GPIO 3.3 V" }).startsWith("rail:"));
});

test("all 16 breadboards preserve electrical nets without shared sockets or accidental shorts", () => {
  let examples = 0;
  const graph = () => {
    const parents = new Map();
    const root = (key) => {
      if (!parents.has(key)) parents.set(key, key);
      if (parents.get(key) !== key) parents.set(key, root(parents.get(key)));
      return parents.get(key);
    };
    return { root, join: (a, b) => parents.set(root(a), root(b)) };
  };
  for (const connection of Object.values(connections)) {
    for (const example of connection.examples) {
      examples++;
      const layout = buildBreadboardLayout(example);
      assert.ok(layout.nodes.length > 0);
      for (const node of layout.nodes) {
        if (/2N3904/.test(node.name)) assert.deepEqual(node.pins.map((pin) => pin.shortLabel), ["E", "B", "C"]);
        if (/Potentiometer/.test(node.name)) assert.deepEqual(node.pins.map((pin) => pin.shortLabel), ["1", "W", "2"]);
      }
      assert.equal(layout.wires.length, example.wires.length);
      const expected = graph(), actual = graph(), sockets = new Set(), terminals = new Set();
      for (const node of layout.nodes) {
        for (const pin of node.pins) {
          assert.ok(!sockets.has(pin.hole.label), example.id + ": shared component socket");
          sockets.add(pin.hole.label);
          actual.join(pin.key, pin.hole.strip);
        }
      }
      for (const [index, wire] of layout.wires.entries()) {
        const source = example.wires[index];
        expected.join(terminalKey(source.from), terminalKey(source.to));
        const points = [wire.from, wire.to];
        for (const point of points) {
          const key = point.terminal.key;
          terminals.add(key);
          assert.ok(point.x > 0 && point.x < layout.width);
          assert.ok(point.y > 0 && point.y < layout.height);
          if (point.terminal.kind === "part") {
            assert.ok(!sockets.has(point.label), example.id + ": jumper shares occupied socket " + point.label);
            sockets.add(point.label);
          } else {
            actual.join(key, point.strip ?? key);
          }
        }
        actual.join(wire.from.strip ?? wire.from.terminal.key, wire.to.strip ?? wire.to.terminal.key);
      }
      for (const a of terminals) {
        for (const b of terminals) {
          assert.equal(actual.root(a) === actual.root(b), expected.root(a) === expected.root(b),
            example.id + ": incorrect breadboard net between " + a + " and " + b);
        }
      }
    }
  }
  assert.equal(examples, 16);
});

test("breadboard jumpers use nearby rails and cross the trench through free component gaps", () => {
  for (const connection of Object.values(connections)) {
    for (const example of connection.examples) {
      const layout = buildBreadboardLayout(example);
      for (const wire of layout.wires) {
        const route = layout.routes[wire.index];
        assert.ok(!/undefined|NaN/.test(route.path));
        for (const [index, point] of route.points.entries()) {
          assert.ok(point.x > 0 && point.x < layout.width);
          assert.ok(point.y > 0 && point.y < layout.height);
          const next = route.points[index + 1];
          if (next && Math.min(point.y, next.y) < 328 && Math.max(point.y, next.y) > 400) {
            assert.ok(layout.nodes.every((node) => Math.abs(node.x - point.x) > 47),
              example.id + ": wire crosses a component body");
          }
        }
      }
    }
  }
  const layout = buildBreadboardLayout(connections.resistor.examples[0]);
  assert.equal(layout.wires[0].from.x, layout.wires[0].to.x);
  assert.equal(layout.wires[2].from.x, layout.wires[2].to.x);
  const route = breadboardWireRoute(layout.wires[1], layout);
  const length = route.points.slice(1).reduce((sum, point, index) =>
    sum + Math.abs(point.x - route.points[index].x) + Math.abs(point.y - route.points[index].y), 0);
  assert.ok(length < 500, "LED jumper should stay local, rather than loop around the board edge");
});

test("focused breadboards keep both endpoint labels, the complete jumper and connected parts in view", () => {
  for (const connection of Object.values(connections)) {
    for (const example of connection.examples) {
      const layout = buildBreadboardLayout(example);
      assert.deepEqual(focusedBreadboardView(layout, null), { x: 0, y: 0, width: 1000, height: 685 });
      for (const wire of layout.wires) {
        const view = focusedBreadboardView(layout, wire.index);
        const inside = ({ x, y }) => {
          assert.ok(x >= view.x && x <= view.x + view.width, example.id + ": clipped horizontal detail");
          assert.ok(y >= view.y && y <= view.y + view.height, example.id + ": clipped vertical detail");
        };
        const close = Math.abs(wire.from.x - wire.to.x) < 180 && Math.abs(wire.from.y - wire.to.y) < 55;
        layout.routes[wire.index].points.forEach(inside);
        for (const [index, point] of [wire.from, wire.to].entries()) {
          const label = endpointLabelBounds(point, index === 0, close);
          inside(label);
          inside({ x: label.x + label.width, y: label.y + label.height });
        }
        const keys = new Set([wire.from.terminal.key, wire.to.terminal.key]);
        for (const node of layout.nodes.filter(node => node.pins.some(pin => keys.has(pin.key)))) {
          inside({ x: node.x - 48, y: 310 });
          inside({ x: node.x + 48, y: 430 });
        }
      }
    }
  }
});
