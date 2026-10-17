import { Cable, ScanText, AlertTriangle, ArrowUpRight } from "lucide-react";
import ResistorReader from "./ResistorReader.jsx";
import ConnectionGuide from "./ConnectionGuide.jsx";

export default function ComponentGuide({ component }) {
  const guide = component.guide;
  if (!guide) return null;
  return (
    <section className="practical-guide" aria-labelledby={"guide-" + component.id}>
      <div className="detail-section-heading">
        <span className="detail-card-number">05</span>
        <div>
          <h2 id={"guide-" + component.id}>อ่านค่าและดูขาอุปกรณ์</h2>
          <p>แยกดูขาต่อและรหัสบนตัวอุปกรณ์ทีละส่วน</p>
        </div>
      </div>
      <div className="guide-columns">
        <article className="detail-info-card">
          <h3><Cable size={19} aria-hidden="true" />ขั้วบวก–ลบ และขาต่อ</h3>
          <p className="polarity-summary">{guide.polarity}</p>
          <ol className="practical-steps">
            {guide.pins.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </article>
        <article className="detail-info-card">
          <h3><ScanText size={19} aria-hidden="true" />วิธีอ่านค่าและรหัส</h3>
          <ol className="practical-steps">
            {guide.reading.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <div className="reading-example">
            <span>ตัวอย่างการอ่าน</span>
            <p>{guide.example}</p>
          </div>
        </article>
      </div>
      {component.id === "resistor" && (
        <section id="library-resistor-calculator" className="detail-calculator" aria-label="เครื่องมือคำนวณตัวต้านทาน">
          <ResistorReader title="คำนวณค่าตัวต้านทาน" />
        </section>
      )}
      <section id={"wiring-" + component.id} className="detail-wiring" aria-label="ภาพและตัวอย่างการต่อวงจร">
        <div className="detail-section-heading">
          <span className="detail-card-number">06</span>
          <div><h2>ภาพและตัวอย่างการต่อวงจร</h2><p>เตรียมอุปกรณ์ แล้วดูจุดต่อทีละสาย</p></div>
        </div>
        <ConnectionGuide component={component} />
      </section>
      <section id={"sources-" + component.id} className="detail-references" aria-label="ข้อควรระวังและเอกสารอ้างอิง">
        <div className="alert alert-warning">
          <AlertTriangle size={18} aria-hidden="true" />
          <div><strong>ก่อนต่อวงจร</strong><p>{guide.caution}</p></div>
        </div>
        <div className="practical-sources">
          <p>เอกสารอ้างอิง / Datasheet</p>
          {guide.sources.map((source) => (
            <a href={source.url} key={source.url} target="_blank" rel="noreferrer" className="text-link">
              {source.title}<ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>
    </section>
  );
}
