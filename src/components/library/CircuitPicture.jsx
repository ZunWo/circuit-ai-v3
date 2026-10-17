import { useId } from "react";
import { buildCircuitLayout } from "../../services/circuitLayout.js";

const colors = { power: "#e11d48", ground: "#475569", signal: "#0284c7" };
const split = (value, size = 23) => {
  const characters = Array.from(value);
  const lines = [];
  while (characters.length) lines.push(characters.splice(0, size).join(""));
  return lines;
};

function PartSymbol({ name, x, y }) {
  if (/ตัวต้านทาน|LDR|NTC|Potentiometer/.test(name))
    return <g stroke="#b45309" strokeWidth="3" fill="#fef3c7">
      <path d={"M" + x + " " + y + "h12m42 0h12"} />
      <rect x={x + 12} y={y - 8} width="42" height="16" rx="5" />
      <path d={"M" + (x + 23) + " " + (y - 7) + "v14m10-14v14"} stroke="#b45309" />
    </g>;
  if (/LED/.test(name))
    return <g><circle cx={x + 33} cy={y} r="14" fill="#fda4af" stroke="#e11d48" strokeWidth="2" /><path d={"M" + (x + 27) + " " + (y - 4) + "l6 8 6-8"} fill="none" stroke="#9f1239" strokeWidth="2" /></g>;
  if (/^C |เซรามิก|ฟิล์ม|อิเล็กโทรไลต์/.test(name))
    return <g stroke="#0369a1" strokeWidth="3"><path d={"M" + x + " " + y + "h27m0-12v24m12-24v24m0-12h27"} /></g>;
  return <g><rect x={x + 14} y={y - 12} width="38" height="24" rx="7" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" /><path d={"M" + (x + 25) + " " + y + "h16m-8-6v12"} stroke="#0284c7" strokeWidth="2" /></g>;
}

export default function CircuitPicture({ example, activeWire = null }) {
  const titleId = useId();
  const layout = buildCircuitLayout(example);
  return (
    <svg className="circuit-picture" viewBox={"0 0 " + layout.width + " " + layout.height} role="img" aria-labelledby={titleId}>
      <title id={titleId}>ภาพการต่อ {example.label}{activeWire === null ? " ทุกสาย" : " สายที่ " + (activeWire + 1)}</title>
      <rect width={layout.width} height={layout.height} rx="20" fill="#f8fafc" />
      {layout.rails.map((rail) => (
        <g key={rail.key}>
          <rect x={rail.x - 55} y={rail.y - 19} width="172" height="38" rx="12" fill={rail.kind === "power" ? "#fff1f2" : "#e2e8f0"} stroke={rail.kind === "power" ? "#fb7185" : "#64748b"} />
          <text x={rail.x + 31} y={rail.y + 5} textAnchor="middle" fill={rail.kind === "power" ? "#be123c" : "#334155"} fontSize="16" fontWeight="700">{rail.kind === "ground" ? "GND / ขั้วลบ" : rail.key.replace("rail:power:", "+")}</text>
        </g>
      ))}
      {layout.wires.map((wire) => {
        const active = activeWire === null || activeWire === wire.index;
        const offset = 18 + (wire.index % 3) * 5;
        const point = (terminal) => ({
          x: terminal.x,
          y: terminal.y + (terminal.kind === "power" ? 19 : terminal.kind === "ground" ? -19 : 0),
          gutter: terminal.x + (terminal.kind !== "part" ? 0 : terminal.side === "right" ? offset : -offset),
        });
        const from = point(wire.from), to = point(wire.to);
        const fromX = from.x, fromY = from.y, toX = to.x, toY = to.y;
        const busY = wire.type === "ground" ? layout.height - 85 - (wire.index % 3) * 3 : 76 + (wire.index % 5) * 5;
        const adjacent = wire.from.kind === "part" && wire.to.kind === "part" &&
          Math.abs(fromY - toY) < 140 &&
          ((fromX < toX && wire.from.side === "right" && wire.to.side === "left") ||
           (fromX > toX && wire.from.side === "left" && wire.to.side === "right"));
        const middleX = (fromX + toX) / 2;
        const route = adjacent
          ? "M" + fromX + " " + fromY + "H" + middleX + "V" + toY + "H" + toX
          : "M" + fromX + " " + fromY + "H" + from.gutter + "V" + busY + "H" + to.gutter + "V" + toY + "H" + toX;
        const labelX = adjacent ? middleX : (from.gutter + to.gutter) / 2;
        const labelY = adjacent ? (fromY + toY) / 2 : busY;
        return <g key={wire.index} className="circuit-drawn-wire" data-wire-index={wire.index} opacity={active ? 1 : 0.12}>
          <path d={route} fill="none" stroke="#ffffff" strokeWidth={active ? 9 : 6} />
          <path d={route} fill="none" stroke={colors[wire.type]} strokeWidth={active ? 4 : 2} strokeLinecap="round" />
          <circle cx={fromX} cy={fromY} r="5" fill={colors[wire.type]} />
          <circle cx={toX} cy={toY} r="5" fill={colors[wire.type]} />
          {active && <g>
            <circle cx={labelX} cy={labelY} r="11" fill={colors[wire.type]} stroke="#ffffff" strokeWidth="2" />
            <text x={labelX} y={labelY + 4} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700">{wire.index + 1}</text>
          </g>}
        </g>;
      })}
      {layout.nodes.map((node) => (
        <g key={node.name}>
          <rect x={node.x} y={node.y} width={node.width} height={node.height} rx="15" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
          <PartSymbol name={node.name} x={node.x + 12} y={node.y + 25} />
          {split(node.name, 21).map((line, index) => <text key={index} x={node.x + 85} y={node.y + 23 + index * 18} fill="#0f172a" fontSize="14" fontWeight="700">{line}</text>)}
          <path d={"M" + (node.x + 15) + " " + (node.y + 57) + "h" + (node.width - 30)} stroke="#e2e8f0" />
          {node.pins.map((pin) => <g key={pin.key}>
            <circle cx={pin.x} cy={pin.y} r="5" fill="#0ea5e9" stroke="#ffffff" strokeWidth="2" />
            {split(pin.pin, 25).slice(0, 2).map((line, index) => <text key={index} x={pin.side === "right" ? pin.x - 13 : pin.x + 13} y={pin.y + 4 + index * 14} textAnchor={pin.side === "right" ? "end" : "start"} fill="#334155" fontSize="13">{line}</text>)}
          </g>)}
        </g>
      ))}
      <text x="24" y={layout.height - 13} fill="#64748b" fontSize="12">ชื่อขาในภาพใช้เทียบกับอุปกรณ์รุ่นจริง · เส้นแดง = ไฟบวก · เทา = กราวด์ · ฟ้า = สัญญาณ</text>
    </svg>
  );
}
