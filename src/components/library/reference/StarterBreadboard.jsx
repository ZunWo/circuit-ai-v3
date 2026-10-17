// Adapted from keenzachanathip-bit/Electronic-Components-Librarys @ 577ded1523fe7fce4b70063510a9fb26f63807f1. See docs/integrations.md.
export default function StarterBreadboard() {
  const columns = Array.from({ length: 10 }, (_, index) => index + 1);
  const upperRows = ["A", "B", "C", "D", "E"];
  const lowerRows = ["F", "G", "H", "I", "J"];
  const holeX = (column) => 130 + (column - 1) * 49;

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#080e19] p-3" role="img" aria-label="ภาพ breadboard: ขั้วบวก 5 โวลต์ ผ่านตัวต้านทาน 330 โอห์มเข้ารู A3; LED ขา A ที่ E3 ขา K ที่ F3; รู J3 ต่อรางลบ GND">
      <svg viewBox="0 0 700 405" className="w-full" aria-hidden="true">
        <rect x="55" y="25" width="615" height="355" rx="22" fill="#182536" stroke="#45566d" strokeWidth="2" />
        <rect x="75" y="45" width="575" height="40" rx="8" fill="#172b39" />
        <rect x="75" y="325" width="575" height="40" rx="8" fill="#172b39" />
        <path d="M90 59H633" stroke="#fb7185" strokeWidth="3" />
        <path d="M90 349H633" stroke="#67e8f9" strokeWidth="3" />
        <text x="93" y="53" fill="#fda4af" fontSize="15" fontWeight="bold">+5 V</text>
        <text x="93" y="343" fill="#a5f3fc" fontSize="15" fontWeight="bold">− GND</text>
        <rect x="92" y="185" width="540" height="30" rx="6" fill="#0b1220" />
        <text x="470" y="204" fill="#8495ab" fontSize="12">ร่องกลาง</text>
        {columns.map((column) => <text key={`c${column}`} x={holeX(column)} y="109" textAnchor="middle" fill="#a5b4c7" fontSize="13">{column}</text>)}
        {upperRows.map((row, rowIndex) => (
          <g key={row}>
            <text x="97" y={136 + rowIndex * 12} fill="#a5b4c7" fontSize="12">{row}</text>
            {columns.map((column) => <circle key={column} cx={holeX(column)} cy={132 + rowIndex * 12} r="3.3" fill="#758aa1" />)}
          </g>
        ))}
        {lowerRows.map((row, rowIndex) => (
          <g key={row}>
            <text x="97" y={240 + rowIndex * 12} fill="#a5b4c7" fontSize="12">{row}</text>
            {columns.map((column) => <circle key={column} cx={holeX(column)} cy={236 + rowIndex * 12} r="3.3" fill="#758aa1" />)}
          </g>
        ))}
        <path d="M228 59V90" stroke="#fda4af" strokeWidth="4" strokeLinecap="round" />
        <rect x="216" y="90" width="24" height="32" rx="6" fill="#e2c69e" stroke="#f8e4c3" />
        <path d="M221 94V118M225 94V118" stroke="#f97316" strokeWidth="2" />
        <path d="M229 94V118" stroke="#92400e" strokeWidth="2" />
        <path d="M228 122V132" stroke="#fda4af" strokeWidth="4" strokeLinecap="round" />
        <text x="260" y="98" fill="#f8e4c3" fontSize="15" fontWeight="bold">330 Ω</text>
        <text x="260" y="117" fill="#a5b4c7" fontSize="12">+ → A3</text>
        <path d="M228 180V190M228 220V236" stroke="#cbd5e1" strokeWidth="4" />
        <circle cx="228" cy="205" r="17" fill="#fb7185" stroke="#fecdd3" strokeWidth="2" />
        <path d="M222 202L228 208L234 202" fill="none" stroke="#fff1f2" strokeWidth="2" />
        <text x="260" y="190" fill="#fda4af" fontSize="13" fontWeight="bold">A ที่ E3</text>
        <text x="260" y="230" fill="#a5f3fc" fontSize="13" fontWeight="bold">K ที่ F3</text>
        <path d="M228 284V349" stroke="#67e8f9" strokeWidth="4" strokeLinecap="round" />
        <text x="260" y="315" fill="#a5f3fc" fontSize="13">J3 → GND</text>
        <text x="400" y="392" fill="#94a3b8" fontSize="13" textAnchor="middle">รู A–E คอลัมน์เดียวกันเชื่อมถึงกัน · รู F–J เชื่อมกันอีกฝั่ง</text>
      </svg>
    </div>
  );
}
