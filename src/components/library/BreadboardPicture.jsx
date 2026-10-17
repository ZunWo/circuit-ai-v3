import { useId } from "react";
import { boardRows, boardX, buildBreadboardLayout, endpointLabelBounds, focusedBreadboardView } from "../../services/breadboardLayout.js";

const colors = { power: "#e11d48", ground: "#475569", signal: "#0284c7" };
const lines = (value, length = 20) => Array.from(value).reduce((result, char, index) => {
  if (index % length === 0) result.push("");
  result[result.length - 1] += char;
  return result;
}, []);

function PartBody({ name, x }) {
  const y = 365;
  if (/ตัวต้านทาน/.test(name)) return <g>
    <rect x={x - 13} y={y - 24} width="26" height="48" rx="9" fill="#e7c899" stroke="#a16207" strokeWidth="2" />
    {[-13, -5, 4, 15].map((dy, index) => <path key={dy} d={`M${x - 12} ${y + dy}h24`} stroke={["#b45309", "#ea580c", "#713f12", "#ca8a04"][index]} strokeWidth="4" />)}
  </g>;
  if (/1N4007/.test(name)) return <g>
    <rect x={x - 13} y={y - 24} width="26" height="48" rx="7" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
    <path d={`M${x - 12} ${y + 13}h24`} stroke="#e2e8f0" strokeWidth="7" />
  </g>;
  if (/อิเล็กโทรไลต์/.test(name)) return <g>
    <rect x={x - 22} y={y - 27} width="44" height="54" rx="10" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
    <path d={`M${x + 11} ${y - 24}v48`} stroke="#cbd5e1" strokeWidth="10" />
    <text x={x + 11} y={y + 5} textAnchor="middle" fill="#1e293b" fontSize="18">−</text>
    <text x={x - 10} y={y + 5} textAnchor="middle" fill="#fff" fontSize="17">+</text>
  </g>;
  if (/เซรามิก|NTC|LDR/.test(name)) return <g>
    <circle cx={x} cy={y} r="24" fill={/NTC/.test(name) ? "#15803d" : "#d97706"} stroke="#fde68a" strokeWidth="2" />
    {/LDR/.test(name) ? <path d={`M${x - 13} ${y - 16}v32h7v-32h7v32h7v-32`} fill="none" stroke="#78350f" strokeWidth="3" /> :
      <text x={x} y={y + 5} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">{/NTC/.test(name) ? "NTC" : "104"}</text>}
  </g>;
  if (/ฟิล์ม/.test(name)) return <g>
    <rect x={x - 27} y={y - 20} width="54" height="40" rx="6" fill="#2563eb" stroke="#93c5fd" strokeWidth="2" />
    <text x={x} y={y + 5} textAnchor="middle" fill="#fff" fontSize="14">100nF</text>
  </g>;
  if (/Potentiometer/.test(name)) return <g>
    <rect x={x - 35} y={y - 25} width="70" height="50" rx="9" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="2" />
    <circle cx={x} cy={y} r="18" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="2" />
    <path d={`M${x - 9} ${y + 9}l18-18`} stroke="#1e293b" strokeWidth="4" />
  </g>;
  if (/ปุ่ม/.test(name)) return <g>
    <rect x={x - 27} y={y - 27} width="54" height="54" rx="6" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
    <circle cx={x} cy={y} r="17" fill="#0e7490" stroke="#67e8f9" strokeWidth="2" />
  </g>;
  if (/Buzzer/.test(name)) return <g>
    <circle cx={x} cy={y} r="27" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
    <circle cx={x} cy={y} r="6" fill="#020617" />
    <text x={x - 13} y={y - 9} textAnchor="middle" fill="#fff" fontSize="16">+</text>
  </g>;
  if (/2N3904/.test(name)) return <g>
    <path d={`M${x - 33} ${y + 17}v-27a33 28 0 0 1 66 0v27Z`} fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
    <text x={x} y={y + 6} textAnchor="middle" fill="#f1f5f9" fontSize="12">NPN</text>
  </g>;
  return <g>
    <path d={`M${x - 20} ${y + 22}v-23a20 20 0 0 1 40 0v23Z`} fill={/Photo/.test(name) ? "#334155" : /IR/.test(name) ? "#c4b5fd" : "#fb7185"} stroke="#fda4af" strokeWidth="2" />
    <path d={`M${x - 10} ${y - 7}q0-8 8-8`} fill="none" stroke="#fff" strokeWidth="3" />
  </g>;
}

function EndpointLabel({ point, start, close }) {
  const { text, width, x, y } = endpointLabelBounds(point, start, close);
  const color = start ? "#15803d" : "#c2410c";
  return <g className="breadboard-endpoint" data-endpoint={start ? "from" : "to"}>
    <circle cx={point.x} cy={point.y} r="10" fill="#fff" stroke={color} strokeWidth="4" />
    <circle cx={point.x} cy={point.y} r="4" fill={color} />
    <rect x={x} y={y} width={width} height="32" rx="9" fill={color} stroke="#fff" strokeWidth="2" />
    <text x={x + width / 2} y={y + 22} textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold">{text}</text>
  </g>;
}

export default function BreadboardPicture({ example, activeWire = null, focusWire = true }) {
  const titleId = useId();
  const layout = buildBreadboardLayout(example);
  const columns = Array.from({ length: 30 }, (_, index) => index + 1);
  const activeTerminals = activeWire === null ? null : new Set([
    layout.wires[activeWire]?.from.terminal.key, layout.wires[activeWire]?.to.terminal.key,
  ]);
  const selected = activeWire === null ? null : layout.wires[activeWire];
  const closeEndpoints = selected && Math.abs(selected.from.x - selected.to.x) < 180 && Math.abs(selected.from.y - selected.to.y) < 55;
  const view = focusedBreadboardView(layout, focusWire ? activeWire : null);
  return <svg className="breadboard-picture" data-focused={focusWire && activeWire !== null} viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`} role="img" aria-labelledby={titleId}>
    <title id={titleId}>ภาพ breadboard: {example.label}{activeWire === null ? " ทุกสาย" : " สายที่ " + (activeWire + 1)}</title>
    <rect width="1000" height="685" rx="20" fill="#0b1220" />
    <text x="34" y="34" fill="#f1f5f9" fontSize="19" fontWeight="700">{example.label}</text>
    {layout.external.map((pin) => <g key={pin.key}>
      <rect x={pin.x - 89} y="46" width="178" height="50" rx="8" fill="#172b3b" stroke="#67e8f9" />
      {/7-Segment/.test(pin.part) && <g transform={`translate(${pin.x - 81} 53)`}>
        <rect width="20" height="34" rx="3" fill="#020617" />
        <path d="M5 5h10M4 7v8m12-8v8M5 17h10M4 19v8m12-8v8M5 29h10" stroke="#fb7185" strokeWidth="2.5" strokeLinecap="round" />
      </g>}
      <text x={pin.x} y="64" textAnchor="middle" fill="#e2e8f0" fontSize="12">{pin.part}</text>
      <text x={pin.x} y="85" textAnchor="middle" fill="#67e8f9" fontSize="14" fontWeight="bold">{pin.shortLabel}</text>
      <path d={`M${pin.x} 96v8`} stroke="#67e8f9" strokeWidth="3" />
      <circle cx={pin.x} cy={pin.y} r="3" fill="#67e8f9" />
    </g>)}
    <rect x="44" y="136" width="910" height="445" rx="22" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
    <rect x="85" y="328" width="837" height="72" rx="8" fill="#cbd5e1" />
    <text x="915" y="363" textAnchor="end" fill="#475569" fontSize="12">ร่อง</text>
    <text x="915" y="381" textAnchor="end" fill="#475569" fontSize="12">กลาง</text>
    <path d="M98 157H915" stroke="#e11d48" strokeWidth="3" />
    <path d="M98 566H915" stroke="#475569" strokeWidth="3" />
    <text x="102" y="128" fill="#fda4af" fontSize="15" fontWeight="bold">{layout.powerLabel === "+VCC" ? "VCC ตามพิกัด IC → ราง +" : layout.powerLabel.startsWith("+") ? layout.powerLabel + " → ราง +" : layout.powerLabel}</text>
    <text x="930" y="128" textAnchor="end" fill="#cbd5e1" fontSize="13">GND ทุกวงจรต่อร่วมกันที่ราง −</text>
    {[175, 550].map((y) => <g key={y}>
      <text x="68" y={y + 6} fill={y === 175 ? "#be123c" : "#334155"} fontSize="22" fontWeight="bold">{y === 175 ? "+" : "−"}</text>
      {columns.map((column) => <circle key={column} cx={boardX(column)} cy={y} r="4" fill="#64748b" />)}
    </g>)}
    {layout.nodes.flatMap((node) => node.pins.map((pin) => <path key={pin.key}
      d={`M${pin.hole.x} ${pin.hole.row === "E" ? 230 : 415}v80`} stroke="#38bdf8"
      strokeWidth="16" strokeLinecap="round" opacity={activeTerminals?.has(pin.key) ? 0.55 : 0.06} />))}
    {columns.map((column) => <text key={column} x={boardX(column)} y="220" textAnchor="middle" fill="#475569" fontSize="12">{column}</text>)}
    {Object.entries(boardRows).map(([row, y]) => <g key={row}>
      <text x="68" y={y + 5} fill="#475569" fontSize="15" fontWeight="bold">{row}</text>
      {columns.map((column) => <circle key={column} cx={boardX(column)} cy={y} r="4" fill="#64748b" />)}
    </g>)}
    {layout.wires.map((wire) => {
      const active = activeWire === null || activeWire === wire.index;
      const route = layout.routes[wire.index];
      return <g key={wire.index} className="breadboard-drawn-wire" data-wire-index={wire.index} opacity={active ? 1 : 0} aria-hidden={!active} pointerEvents={active ? "auto" : "none"}>
        <title>สายที่ {wire.index + 1}: {wire.from.label} → {wire.to.label}</title>
        <path d={route.path} fill="none" stroke="#f8fafc" strokeWidth={activeWire === null ? 8 : 12} strokeLinejoin="round" />
        <path d={route.path} fill="none" stroke={colors[wire.type]} strokeWidth={activeWire === null ? 4 : 7} strokeLinecap="round" strokeLinejoin="round" />
        {[wire.from, wire.to].map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="5" fill={colors[wire.type]} stroke="#fff" strokeWidth="1.5" />)}
      </g>;
    })}
    {activeWire === null && layout.wires.map((wire) => {
      const route = layout.routes[wire.index];
      return <g key={wire.index}>
        <circle cx={route.labelX} cy={route.labelY} r="12" fill={colors[wire.type]} stroke="#fff" strokeWidth="2" />
        <text x={route.labelX} y={route.labelY + 4} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">{wire.index + 1}</text>
      </g>;
    })}
    {layout.nodes.map((node) => <g key={node.name} className="breadboard-part" data-part={node.name}
      opacity={!activeTerminals || node.pins.some((pin) => activeTerminals.has(pin.key)) ? 1 : 0.4}>
      {node.pins.map((pin) => <g key={pin.key}>
        <path d={`M${pin.hole.x} ${pin.hole.y}V${pin.hole.row === "E" ? 346 : 389}`} stroke="#f8fafc" strokeWidth="7" />
        <path d={`M${pin.hole.x} ${pin.hole.y}V${pin.hole.row === "E" ? 346 : 389}`} stroke="#64748b" strokeWidth="3" />
        <circle cx={pin.hole.x} cy={pin.hole.y} r="5" fill="#0e7490" stroke="#fff" strokeWidth="1.5" />
        <text x={pin.hole.x + (node.pins.length === 2 ? 17 : 0)} y={pin.hole.row === "E" ? 335 : 410}
          textAnchor={node.pins.length === 2 ? "start" : "middle"} fill="#0f172a" fontSize="12" fontWeight="bold">{pin.shortLabel}</text>
      </g>)}
      <PartBody name={node.name} x={node.x} />
      {lines(node.name.replace("ตัวต้านทาน", "R"), 19).map((line, index) => <text key={index} x={node.x} y={607 + index * 19} textAnchor="middle" fill="#f1f5f9" fontSize="15" fontWeight="bold">{line}</text>)}
      <text x={node.x} y="650" textAnchor="middle" fill="#7dd3fc" fontSize="13">{node.pins.map((pin) => pin.shortLabel + ":" + pin.hole.label).join(" · ")}</text>
    </g>)}
    {activeWire !== null && <>
      <EndpointLabel point={selected.from} start close={closeEndpoints} />
      <EndpointLabel point={selected.to} close={closeEndpoints} />
    </>}
    <text x="500" y="674" textAnchor="middle" fill="#94a3b8" fontSize="13">A–E เลขเดียวกันเชื่อมถึงกัน · F–J เชื่อมกันอีกฝั่ง · ปิดไฟก่อนต่อสาย</text>
  </svg>;
}
