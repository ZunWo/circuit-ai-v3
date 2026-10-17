import { terminalKey } from "./circuitLayout.js";

export const boardRows = { A: 230, B: 250, C: 270, D: 290, E: 310, F: 415, G: 435, H: 455, I: 475, J: 495 };
export const boardX = (column) => 108 + (column - 1) * 27;

export function holeAt(row, column) {
  return { row, column, x: boardX(column), y: boardRows[row], label: row + column,
    strip: (row < "F" ? "upper:" : "lower:") + column };
}

export function shortPin(pin) {
  if (/Collector/.test(pin)) return "C";
  if (/Emitter/.test(pin)) return "E";
  if (/Base/.test(pin)) return "B";
  if (/Wiper/.test(pin)) return "W";
  if (/COM/.test(pin)) return "COM";
  if (/ขา a/.test(pin)) return "a";
  if (/Anode|ขาบวก|^A /.test(pin)) return "A (+)";
  if (/Cathode|ขาลบ|^K /.test(pin)) return "K (−)";
  if (/ขา \+/.test(pin)) return "+";
  if (/ขา −/.test(pin)) return "−";
  if (/ฝั่งที่ 1|ด้านหนึ่ง/.test(pin)) return "1";
  if (/ฝั่งที่ 2|อีกด้าน/.test(pin)) return "2";
  return pin;
}

export function endpointLabelBounds(point, start, close) {
  const label = point.terminal.kind === "external" ? point.terminal.shortLabel :
    point.label.replace("ราง ", "").replace(" (GND)", "");
  const text = (start ? "จาก " : "ไป ") + label;
  const width = Array.from(text).length * 10 + 24;
  return { text, width, height: 32,
    x: point.x + width + 22 < 955 ? point.x + 18 : point.x - width - 18,
    y: close ? point.y + (start ? -56 : 20) : point.terminal.kind === "external" ? point.y + 12 : point.y - 16 };
}

export function focusedBreadboardView(layout, index) {
  if (index === null) return { x: 0, y: 0, width: layout.width, height: layout.height };
  const wire = layout.wires[index];
  const close = Math.abs(wire.from.x - wire.to.x) < 180 && Math.abs(wire.from.y - wire.to.y) < 55;
  const points = [...layout.routes[index].points];
  for (const [position, point] of [wire.from, wire.to].entries()) {
    const label = endpointLabelBounds(point, position === 0, close);
    points.push({ x: label.x, y: label.y }, { x: label.x + label.width, y: label.y + label.height });
    if (point.terminal.kind === "external") points.push({ x: point.x - 89, y: 46 }, { x: point.x + 89, y: 104 });
  }
  const keys = new Set([wire.from.terminal.key, wire.to.terminal.key]);
  for (const node of layout.nodes.filter(node => node.pins.some(pin => keys.has(pin.key)))) {
    points.push({ x: node.x - 48, y: 310 }, { x: node.x + 48, y: 430 });
  }
  const left = Math.min(...points.map(p => p.x)) - 26, right = Math.max(...points.map(p => p.x)) + 26;
  const top = Math.max(0, Math.min(...points.map(p => p.y)) - 30);
  const bottom = Math.min(layout.height, Math.max(...points.map(p => p.y)) + 30);
  const height = bottom - top;
  const width = Math.min(layout.width, Math.max(360, right - left, height / 1.1));
  return { x: Math.max(0, Math.min(layout.width - width, (left + right - width) / 2)), y: top, width, height };
}

// Components occupy separate five-hole strips. Jumper ends use free holes on
// those strips, never the same socket as a component lead or another jumper.
export function buildBreadboardLayout(example) {
  const terminals = new Map();
  const parts = new Map();
  for (const wire of example.wires) {
    for (const terminal of [wire.from, wire.to]) {
      const key = terminalKey(terminal);
      if (terminals.has(key)) continue;
      const kind = key.startsWith("rail:ground") ? "ground" :
        key.startsWith("rail:power:") ? "power" :
          /^(บอร์ด|แหล่ง|วงจร)|7-Segment/.test(terminal.part) ? "external" : "part";
      const entry = { ...terminal, key, kind, shortLabel: shortPin(terminal.pin) };
      terminals.set(key, entry);
      if (kind === "part") {
        if (!parts.has(terminal.part)) parts.set(terminal.part, []);
        parts.get(terminal.part).push(entry);
      }
    }
  }
  const nodes = [...parts].map(([name, pins], index) => {
    // Front-view 2N3904: E/B/C; standard potentiometer: end/wiper/end.
    // Sort named leads independently of the order in the connection list.
    const pinOrder = /2N3904/.test(name) ? ["E", "B", "C"] :
      /Potentiometer/.test(name) ? ["1", "W", "2"] : null;
    if (pinOrder) pins.sort((a, b) => pinOrder.indexOf(a.shortLabel) - pinOrder.indexOf(b.shortLabel));
    const column = 3 + index * 5 + Math.floor((6 - parts.size) * 2.5);
    const x = boardX(column);
    pins.forEach((pin, pinIndex) => {
      pin.hole = pins.length === 2 ? holeAt(pinIndex ? "F" : "E", column) :
        holeAt("E", column - 1 + pinIndex);
    });
    return { name, pins, x, column };
  });
  const external = [...terminals.values()].filter(({ kind }) => kind === "external");
  external.forEach((pin, index) => {
    pin.x = 170 + index * 205;
    pin.y = 104;
    pin.label = pin.part + " · " + pin.pin;
  });
  const endpointCounts = new Map();
  const usedRailHoles = new Set();
  function endpoint(terminal, otherTerminal) {
    const pin = terminals.get(terminalKey(terminal));
    const count = endpointCounts.get(pin.key) ?? 0;
    endpointCounts.set(pin.key, count + 1);
    if (pin.kind === "part") {
      const rows = pin.hole.row === "E" ? ["A", "B", "C", "D"] : ["J", "I", "H", "G"];
      if (!rows[count]) throw new Error("Too many jumpers on one breadboard strip: " + pin.key);
      return { ...holeAt(rows[count], pin.hole.column), terminal: pin };
    }
    if (pin.kind === "external") return { ...pin, terminal: pin };
    const other = terminals.get(terminalKey(otherTerminal));
    const nearestColumn = other.hole?.column ?? Math.round(((other.x ?? 350) - 108) / 27) + 1;
    const column = Array.from({ length: 30 }, (_, index) => index + 1)
      .sort((a, b) => Math.abs(a - nearestColumn) - Math.abs(b - nearestColumn))
      .find((candidate) => !usedRailHoles.has(pin.key + ":" + candidate));
    usedRailHoles.add(pin.key + ":" + column);
    return { x: boardX(column), y: pin.kind === "power" ? 175 : 550,
      label: pin.kind === "power" ? "ราง +" + column : "ราง −" + column + " (GND)",
      strip: pin.key, terminal: pin };
  }
  const wires = example.wires.map((wire, index) => ({
    ...wire, index, from: endpoint(wire.from, wire.to), to: endpoint(wire.to, wire.from),
  }));
  const power = [...terminals.values()].find(({ kind }) => kind === "power");
  const layout = { width: 1000, height: 685, nodes, external, wires,
    powerLabel: power ? power.key.replace("rail:power:", "+") : "ไม่ใช้ราง + ในตัวอย่างนี้" };
  const usedGutters = [];
  layout.routes = wires.map((wire) => {
    const route = breadboardWireRoute(wire, layout, usedGutters);
    if (route.gutter !== undefined) usedGutters.push(route.gutter);
    return route;
  });
  return layout;
}

function roundedPath(points, radius = 12) {
  let path = `M${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length - 1; index++) {
    const previous = points[index - 1], corner = points[index], next = points[index + 1];
    const before = Math.hypot(corner.x - previous.x, corner.y - previous.y);
    const after = Math.hypot(next.x - corner.x, next.y - corner.y);
    if (!before || !after) continue;
    const bend = Math.min(radius, before / 2, after / 2);
    const enter = { x: corner.x + (previous.x - corner.x) * bend / before, y: corner.y + (previous.y - corner.y) * bend / before };
    const leave = { x: corner.x + (next.x - corner.x) * bend / after, y: corner.y + (next.y - corner.y) * bend / after };
    path += `L${enter.x} ${enter.y}Q${corner.x} ${corner.y} ${leave.x} ${leave.y}`;
  }
  return path + `L${points.at(-1).x} ${points.at(-1).y}`;
}

export function breadboardWireRoute(wire, layout, usedGutters = []) {
  const { from, to, index } = wire;
  let points;
  let labelX, labelY, gutter;
  // Straight supply jumpers land on the rail directly beside the component.
  if (Math.abs(from.x - to.x) < 20 && (Math.max(from.y, to.y) <= 310 || Math.min(from.y, to.y) >= 415)) {
    points = [from, to];
    labelX = from.x; labelY = (from.y + to.y) / 2;
  } else {
  const upper = (point) => point.y <= 310;
  const lane = (point) => upper(point) ? 208 - (index % 4) * 11 : 516 + (index % 3) * 10;
  const fromLane = lane(from);
  if (upper(from) === upper(to)) {
    points = [from, { x: from.x, y: fromLane }, { x: to.x, y: fromLane }, to];
    labelX = (from.x + to.x) / 2; labelY = fromLane;
  } else {
    // Cross the centre trench in a free gap beside the connected components,
    // rather than sending every jumper around the left edge of the board.
    const middle = (from.x + to.x) / 2;
    const candidates = Array.from({ length: 59 }, (_, i) => 94.5 + i * 13.5)
      .filter((x) => layout.nodes.every((node) => Math.abs(node.x - x) > 47));
    const score = (x) => Math.abs(x - middle) + (usedGutters.some((used) => Math.abs(used - x) < 12) ? 1000 : 0);
    gutter = candidates.sort((a, b) => score(a) - score(b))[0];
    const exitY = (point) => point.y + (point.terminal.kind === "external" ? 12 : upper(point) ? -10 : 10);
    const startY = exitY(from), endY = exitY(to);
    points = [from, { x: from.x, y: startY }, { x: gutter, y: startY },
      { x: gutter, y: endY }, { x: to.x, y: endY }, to];
    labelX = gutter; labelY = 340 + (index % 3) * 28;
  }
  }
  return { path: roundedPath(points), points, labelX, labelY, gutter };
}
