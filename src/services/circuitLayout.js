// A terminal graph for educational connection pictures, derived from the wiring data.
export function terminalKey(terminal) {
  const pin = terminal.pin.replace(/\s*\/\s*จุด(?:อ่าน|ร่วม).*$/, "").trim();
  if (/GND/.test(pin)) return "rail:ground";
  if (!/GPIO/.test(pin) && /ขั้วบวก|^ขา 3\.3 V|^VCC/.test(pin)) {
    const voltage = (terminal.part + " " + pin).match(/(?:3\.3|5|3)\s*V/);
    return "rail:power:" + (voltage?.[0].replace(/\s/g, "") ?? "VCC");
  }
  return terminal.part + "::" + pin;
}

export function buildCircuitLayout(example) {
  const terminals = new Map();
  const parts = new Map();
  for (const wire of example.wires) {
    for (const terminal of [wire.from, wire.to]) {
      const key = terminalKey(terminal);
      if (terminals.has(key)) continue;
      const kind = key.startsWith("rail:ground") ? "ground" :
        key.startsWith("rail:power:") ? "power" : "part";
      const entry = { key, ...terminal, kind };
      terminals.set(key, entry);
      if (kind === "part") {
        if (!parts.has(terminal.part)) parts.set(terminal.part, []);
        parts.get(terminal.part).push(entry);
      }
    }
  }
  const width = 900;
  const columns = Math.min(parts.size, 3);
  const startX = (width - (columns * 230 + (columns - 1) * 50)) / 2;
  const gap = 280;
  const rowHeight = Math.max(225, ...[...parts.values()].map((pins) => 110 + pins.length * 38));
  const nodes = [...parts].map(([name, pins], index) => {
    const x = startX + (index % columns) * gap;
    const y = 112 + Math.floor(index / columns) * rowHeight;
    const height = Math.max(150, 82 + pins.length * 38);
    pins.forEach((pin, pinIndex) => {
      pin.x = x;
      pin.y = y + 82 + pinIndex * 38;
      pin.side = "left";
    });
    return { name, x, y, width: 230, height, pins };
  });
  // Place pins on the side facing their connected neighbour whenever possible.
  for (const node of nodes) {
    for (const pin of node.pins) {
      const neighbours = example.wires.flatMap((wire) => {
        const from = terminals.get(terminalKey(wire.from));
        const to = terminals.get(terminalKey(wire.to));
        return from === pin ? [to] : to === pin ? [from] : [];
      });
      const positioned = neighbours.filter((other) => Number.isFinite(other.x));
      if (neighbours.some((other) => other.kind === "ground") || positioned.some((other) => other.x > node.x + node.width)) {
        pin.x = node.x + node.width;
        pin.side = "right";
      }
    }
  }
  const rows = Math.ceil(parts.size / columns);
  const height = 190 + rows * rowHeight;
  const rails = [...terminals.values()].filter(({ kind }) => kind !== "part");
  let positiveIndex = 0;
  for (const rail of rails) {
    rail.x = rail.kind === "ground" ? width - 140 : 70 + positiveIndex++ * 220;
    rail.y = rail.kind === "ground" ? height - 52 : 40;
  }
  const wires = example.wires.map((wire, index) => ({
    ...wire, index,
    from: terminals.get(terminalKey(wire.from)),
    to: terminals.get(terminalKey(wire.to)),
  }));
  return { width, height, nodes, rails, wires };
}
