import { Cable, ScanText, AlertTriangle, ArrowUpRight } from "lucide-react";
import ResistorReader from "./ResistorReader.jsx";

export default function ComponentGuide({ component }) {
  const guide = component.guide;
  if (!guide) return null;
  return (
    <section
      className="practical-guide"
      aria-labelledby={`guide-${component.id}`}
    >
      <div className="practical-guide-heading">
        <p className="eyebrow">READ IT · CONNECT IT</p>
        <h2 id={`guide-${component.id}`}>อ่านค่าและดูขาอุปกรณ์</h2>
        <p>ใช้เครื่องหมายบนชิ้นงานร่วมกับข้อมูลรุ่นก่อนต่อวงจร</p>
      </div>
      <div className="guide-columns">
        <article>
          <h3>
            <Cable size={19} aria-hidden="true" />
            ขั้วบวก–ลบ และขาต่อ
          </h3>
          <p className="polarity-summary">{guide.polarity}</p>
          <ol className="practical-steps">
            {guide.pins.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
        <article>
          <h3>
            <ScanText size={19} aria-hidden="true" />
            วิธีอ่านค่าและรหัส
          </h3>
          <ol className="practical-steps">
            {guide.reading.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="reading-example">
            <span>ตัวอย่างการอ่าน</span>
            <p>{guide.example}</p>
          </div>
        </article>
      </div>
      {component.id === "resistor" && <ResistorReader />}
      <div className="alert alert-warning mt-6">
        <AlertTriangle size={18} aria-hidden="true" />
        <span>{guide.caution}</span>
      </div>
      <div className="practical-sources">
        <p>เอกสารอ้างอิง / Datasheet</p>
        {guide.sources.map((source) => (
          <a
            href={source.url}
            key={source.url}
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            {source.title}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}
