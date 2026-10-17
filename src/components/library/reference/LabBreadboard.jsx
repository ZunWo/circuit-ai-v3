// Adapted from keenzachanathip-bit/Electronic-Components-Librarys @ 577ded1523fe7fce4b70063510a9fb26f63807f1. See docs/integrations.md.
const x = (column) => 130 + (column - 1) * 49;

function Board() {
  const columns = Array.from({ length: 10 }, (_, index) => index + 1);
  return <>
    <rect x="55" y="25" width="615" height="355" rx="22" fill="#182536" stroke="#45566d" strokeWidth="2" />
    <rect x="75" y="45" width="575" height="40" rx="8" fill="#172b39" />
    <rect x="75" y="325" width="575" height="40" rx="8" fill="#172b39" />
    <path d="M90 59H633" stroke="#fb7185" strokeWidth="3" />
    <path d="M90 349H633" stroke="#67e8f9" strokeWidth="3" />
    <text x="93" y="53" fill="#fda4af" fontSize="15" fontWeight="bold">+5 V</text>
    <text x="93" y="343" fill="#a5f3fc" fontSize="15" fontWeight="bold">− GND</text>
    <rect x="92" y="185" width="540" height="30" rx="6" fill="#0b1220" />
    <text x="565" y="205" fill="#8495ab" fontSize="12">ร่องกลาง</text>
    {columns.map((column) => <text key={`n${column}`} x={x(column)} y="109" textAnchor="middle" fill="#a5b4c7" fontSize="13">{column}</text>)}
    {["A", "B", "C", "D", "E"].map((row, index) => <g key={row}><text x="97" y={136 + index * 12} fill="#a5b4c7" fontSize="12">{row}</text>{columns.map((column) => <circle key={column} cx={x(column)} cy={132 + index * 12} r="3.3" fill="#758aa1" />)}</g>)}
    {["F", "G", "H", "I", "J"].map((row, index) => <g key={row}><text x="97" y={240 + index * 12} fill="#a5b4c7" fontSize="12">{row}</text>{columns.map((column) => <circle key={column} cx={x(column)} cy={236 + index * 12} r="3.3" fill="#758aa1" />)}</g>)}
  </>;
}

function HorizontalResistor({ from, to, y, label, stroke = "#fda4af" }) {
  const left = x(from);
  const right = x(to);
  const middle = (left + right) / 2;
  return <g>
    <path d={`M${left} ${y}H${middle - 17}M${middle + 17} ${y}H${right}`} stroke={stroke} strokeWidth="4" strokeLinecap="round" />
    <rect x={middle - 17} y={y - 10} width="34" height="20" rx="5" fill="#e2c69e" stroke="#f8e4c3" />
    <text x={middle} y={y - 16} textAnchor="middle" fill="#f8e4c3" fontSize="12" fontWeight="bold">{label}</text>
  </g>;
}

function VerticalLed({ column }) {
  const cx = x(column);
  return <g>
    <path d={`M${cx} 180V189M${cx} 221V236`} stroke="#cbd5e1" strokeWidth="4" />
    <circle cx={cx} cy="205" r="16" fill="#fb7185" stroke="#fecdd3" strokeWidth="2" />
    <text x={cx + 25} y="191" fill="#fda4af" fontSize="12" fontWeight="bold">A</text>
    <text x={cx + 25} y="235" fill="#a5f3fc" fontSize="12" fontWeight="bold">K</text>
  </g>;
}

function SwitchBody({ from, to }) {
  const left = x(from);
  const right = x(to);
  return <g>
    <rect x={left - 7} y="153" width={right - left + 14} height="35" rx="8" fill="#1e3a4b" stroke="#67e8f9" />
    <circle cx={left + 10} cy="171" r="3" fill="#e2e8f0" />
    <circle cx={right - 10} cy="171" r="3" fill="#e2e8f0" />
    <path d={`M${left + 10} 168L${right - 17} 159`} stroke="#f8fafc" strokeWidth="2" />
    <text x={(left + right) / 2} y="146" textAnchor="middle" fill="#a5f3fc" fontSize="12" fontWeight="bold">NO button</text>
  </g>;
}

function SwitchPlacement() {
  return <>
    <path d={`M${x(2)} 59V132`} stroke="#fda4af" strokeWidth="4" />
    <SwitchBody from={2} to={3} />
    <HorizontalResistor from={3} to={4} y={132} label="330 Ω" />
    <VerticalLed column={4} />
    <path d={`M${x(4)} 284V349`} stroke="#67e8f9" strokeWidth="4" />
    <text x="130" y="307" fill="#a5b4c7" fontSize="12">+ → A2 · S1 E2–E3 · R A3–A4 · LED E4/F4 · J4 → GND</text>
  </>;
}

function DiodePlacement() {
  return <>
    <path d={`M${x(2)} 59V132`} stroke="#fda4af" strokeWidth="4" />
    <path d={`M${x(2)} 156H${x(3)}`} stroke="#fda4af" strokeWidth="4" />
    <rect x="190" y="145" width="28" height="22" rx="5" fill="#111827" stroke="#e2e8f0" />
    <path d="M210 145V167" stroke="#f8fafc" strokeWidth="4" />
    <text x="180" y="181" fill="#fda4af" fontSize="11">A C2</text>
    <text x="217" y="181" fill="#f8fafc" fontSize="11">K C3</text>
    <HorizontalResistor from={3} to={4} y={132} label="330 Ω" />
    <VerticalLed column={4} />
    <path d={`M${x(4)} 284V349`} stroke="#67e8f9" strokeWidth="4" />
    <text x="130" y="307" fill="#a5b4c7" fontSize="12">+ → A2 · 1N4007 C2(A)/C3(K) · R A3–A4 · LED E4/F4 · J4 → GND</text>
  </>;
}

function TransistorPlacement() {
  return <>
    <path d={`M${x(2)} 59V132M${x(9)} 59V132`} stroke="#fda4af" strokeWidth="4" />
    <HorizontalResistor from={2} to={3} y={156} label="330 Ω" />
    <VerticalLed column={3} />
    <path d={`M${x(3)} 284L445 300V119H${x(7)}V132`} fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinejoin="round" />
    <text x="228" y="315" fill="#fbbf24" fontSize="12" fontWeight="bold">J3 → A7 (ขา C)</text>
    <rect x="309" y="78" width="134" height="40" rx="12" fill="#164154" stroke="#67e8f9" />
    <text x="376" y="95" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">2N3904</text>
    <text x="376" y="110" textAnchor="middle" fill="#a5f3fc" fontSize="10">ตรวจผังขาจริงก่อนเสียบ</text>
    {[5, 6, 7].map((col) => <path key={col} d={`M${x(col)} 118V132`} stroke="#cbd5e1" strokeWidth="3" />)}
    <text x={x(5)} y="148" textAnchor="middle" fill="#a5f3fc" fontSize="12" fontWeight="bold">E</text>
    <text x={x(6)} y="148" textAnchor="middle" fill="#a5f3fc" fontSize="12" fontWeight="bold">B</text>
    <text x={x(7)} y="148" textAnchor="middle" fill="#a5f3fc" fontSize="12" fontWeight="bold">C</text>
    <path d={`M${x(5)} 180V349`} stroke="#67e8f9" strokeWidth="4" />
    <path d={`M${x(6)} 180V188M${x(6)} 225V236M${x(6)} 284V349`} stroke="#67e8f9" strokeWidth="4" />
    <rect x={x(6) - 11} y="188" width="22" height="37" rx="5" fill="#e2c69e" stroke="#f8e4c3" />
    <text x={x(6) + 17} y="206" fill="#f8e4c3" fontSize="12">100 kΩ</text>
    <SwitchBody from={8} to={9} />
    <HorizontalResistor from={6} to={8} y={156} label="4.7 kΩ" stroke="#c4b5fd" />
    <text x="474" y="315" fill="#a5b4c7" fontSize="12">S1: E8–E9</text>
  </>;
}

const placements = { Switch: SwitchPlacement, Diode: DiodePlacement, Transistor: TransistorPlacement };
const descriptions = {
  Switch: "breadboard ตัวอย่าง: ไฟบวกต่อ A2, หน้าสัมผัสสองขาของปุ่มกด NO ระหว่าง E2 กับ E3, ตัวต้านทาน 330 โอห์มระหว่าง A3 กับ A4, LED ขา A ที่ E4 ขา K ที่ F4, J4 ลง GND; ปุ่ม 4 ขาต้องตรวจคู่ขาจริงก่อนเสียบ",
  Diode: "breadboard ตัวอย่าง: ไฟบวกต่อ A2, ไดโอด 1N4007 ขา A ที่ C2 ขา K ที่ C3, ตัวต้านทาน 330 โอห์ม A3 ถึง A4, LED E4 ถึง F4, J4 ลง GND",
  Transistor: "breadboard ตัวอย่างหลังตรวจผังขา: R 330 โอห์มระหว่าง C2 กับ C3, LED ขา A ที่ E3 ขา K ที่ F3, J3 ต่อ A7 ซึ่งเป็นขา C ของ 2N3904; ขา E ที่ A5 ต่อ GND, ขา B ที่ A6 ต่อ R 100 กิโลโอห์มลง GND; ไฟบวกผ่านสวิตช์ E9 ถึง E8 และ R 4.7 กิโลโอห์มระหว่าง C8 กับ C6 ไปขา B",
};

export default function LabBreadboard({ type }) {
  const Placement = placements[type];
  if (!Placement) return null;
  return <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#080e19] p-3" role="img" aria-label={descriptions[type]}>
    <svg viewBox="0 0 700 405" className="w-full" aria-hidden="true"><Board /><Placement /><text x="350" y="392" textAnchor="middle" fill="#94a3b8" fontSize="12">รู A–E คอลัมน์เดียวกันเชื่อมถึงกัน · รู F–J เชื่อมกันอีกฝั่ง</text></svg>
  </div>;
}
