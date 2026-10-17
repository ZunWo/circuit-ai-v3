import { useState } from "react";
import { resistorColors } from "../../data/components.js";

const colorsById = Object.fromEntries(
  resistorColors.map((color) => [color.id, color]),
);
const digits = resistorColors.filter((color) => color.digit !== undefined);
const tolerances = resistorColors.filter(
  (color) => color.tolerance !== undefined,
);
const number = (value) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value);
const resistance = (value) =>
  value >= 1e6
    ? `${number(value / 1e6)} MΩ`
    : value >= 1e3
      ? `${number(value / 1e3)} kΩ`
      : `${number(value)} Ω`;

export default function ResistorReader({ title = "ลองอ่านแถบสีตัวต้านทาน" }) {
  const [bandCount, setBandCount] = useState(4);
  const [selected, setSelected] = useState({
    first: "yellow",
    second: "violet",
    third: "black",
    multiplier: "red",
    tolerance: "gold",
  });
  const fields = [
    {
      id: "first",
      title: "แถบ 1 · หลักแรก",
      options: digits.filter((color) => color.digit !== 0),
    },
    { id: "second", title: "แถบ 2 · หลักที่สอง", options: digits },
    ...(bandCount === 5
      ? [{ id: "third", title: "แถบ 3 · หลักที่สาม", options: digits }]
      : []),
    {
      id: "multiplier",
      title: `แถบ ${bandCount - 1} · ตัวคูณ`,
      options: resistorColors,
    },
    {
      id: "tolerance",
      title: `แถบ ${bandCount} · คลาดเคลื่อน`,
      options: tolerances,
    },
  ];
  const significant = Number(
    [
      selected.first,
      selected.second,
      ...(bandCount === 5 ? [selected.third] : []),
    ]
      .map((id) => colorsById[id].digit)
      .join(""),
  );
  const multiplier = colorsById[selected.multiplier].multiplier;
  const tolerance = colorsById[selected.tolerance].tolerance;
  const value = significant * multiplier;
  const positions =
    bandCount === 4 ? [135, 180, 225, 325] : [125, 165, 205, 250, 325];
  return (
    <section
      className="resistor-reader"
      aria-labelledby="resistor-reader-title"
    >
      <div className="reader-heading">
        <div>
          <h3 id="resistor-reader-title">{title}</h3>
          <p>เลือกสีตามอุปกรณ์ แล้วดูวิธีคำนวณ</p>
        </div>
        <div className="band-toggle" aria-label="จำนวนแถบสี">
          {[4, 5].map((count) => (
            <button
              key={count}
              type="button"
              aria-pressed={bandCount === count}
              onClick={() => setBandCount(count)}
            >
              {count} แถบ
            </button>
          ))}
        </div>
      </div>
      <svg
        className="resistor-illustration"
        viewBox="0 0 480 110"
        role="img"
        aria-label={`ตัวอย่าง ${bandCount} แถบสี: ${fields.map((field) => colorsById[selected[field.id]].name).join(" ")} อ่านได้ ${resistance(value)}`}
      >
        <line
          x1="15"
          y1="55"
          x2="105"
          y2="55"
          stroke="#94a3b8"
          strokeWidth="6"
        />
        <line
          x1="375"
          y1="55"
          x2="465"
          y2="55"
          stroke="#94a3b8"
          strokeWidth="6"
        />
        <rect
          x="90"
          y="24"
          width="300"
          height="62"
          rx="24"
          fill="#f3dfb7"
          stroke="#c9ac7c"
          strokeWidth="2"
        />
        {fields.map((field, index) => (
          <rect
            key={field.id}
            x={positions[index]}
            y="25"
            width="15"
            height="60"
            fill={colorsById[selected[field.id]].hex}
            stroke="#0f172a"
            strokeOpacity="0.12"
          />
        ))}
      </svg>
      <div className="band-fields">
        {fields.map((field) => (
          <label key={field.id} htmlFor={`band-${field.id}`}>
            <span>{field.title}</span>
            <select
              id={`band-${field.id}`}
              value={selected[field.id]}
              onChange={(event) =>
                setSelected((current) => ({
                  ...current,
                  [field.id]: event.target.value,
                }))
              }
            >
              {field.options.map((color) => (
                <option value={color.id} key={color.id}>
                  {color.name}
                  {field.id === "multiplier"
                    ? ` ×${number(color.multiplier)}`
                    : field.id === "tolerance"
                      ? ` ±${color.tolerance}%`
                      : ` · ${color.digit}`}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="reader-result" role="status" aria-live="polite">
        <strong>
          {resistance(value)} <span>±{tolerance}%</span>
        </strong>
        <p>
          {significant} × {number(multiplier)} = {number(value)} Ω
        </p>
        <p>
          ช่วงค่าที่ยอมรับได้: {resistance(value * (1 - tolerance / 100))} –{" "}
          {resistance(value * (1 + tolerance / 100))}
        </p>
      </div>
      <details className="color-reference">
        <summary>ดูตารางสีและค่าที่ใช้</summary>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">ตารางรหัสสีตัวต้านทาน</caption>
            <thead>
              <tr>
                <th scope="col">สี</th>
                <th scope="col">ตัวเลข</th>
                <th scope="col">ตัวคูณ</th>
                <th scope="col">คลาดเคลื่อน</th>
              </tr>
            </thead>
            <tbody>
              {resistorColors.map((color) => (
                <tr key={color.id}>
                  <th scope="row">
                    <span
                      className="color-swatch"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                  </th>
                  <td>{color.digit ?? "—"}</td>
                  <td>×{number(color.multiplier)}</td>
                  <td>{color.tolerance ? `±${color.tolerance}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-6 text-slate-500">
          แบบ 3 แถบที่ไม่มีแถบ tolerance มักใช้ ±20%
          ตารางนี้ใช้กับตัวต้านทานรหัสสีทั่วไป ไม่ครอบคลุมรหัสพิเศษของผู้ผลิต
        </p>
      </details>
    </section>
  );
}
