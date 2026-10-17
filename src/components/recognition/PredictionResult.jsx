import { Link } from "react-router-dom";
import { ScanLine, ArrowUpRight, AlertCircle, CheckCircle2, FlaskConical } from "lucide-react";
import { isConfidentPrediction, lowConfidenceMessage } from "../../services/teachableMachine.js";
import AssetPlaceholder from "../common/AssetPlaceholder.jsx";
import ConnectionGuide from "../library/ConnectionGuide.jsx";
import ResistorReader from "../library/ResistorReader.jsx";
import AnalysisLoading from "./AnalysisLoading.jsx";

const percent = (value) => value > 70 && value.toFixed(1) === "70.0" ? ">70.0%" : value.toFixed(1) + "%";

export default function PredictionResult({ state, previewUrl }) {
  if (state.status === "analyzing") return <AnalysisLoading previewUrl={previewUrl} />;
  const confidenceError = state.result && !isConfidentPrediction(state.result);
  if (state.status === "error" || confidenceError)
    return (
      <div className="result-empty prediction-error" role="alert">
        <span className="result-empty-icon text-rose-600"><AlertCircle size={32} aria-hidden="true" /></span>
        <h3>วิเคราะห์ภาพไม่สำเร็จ</h3>
        <p className="break-words">{confidenceError ? lowConfidenceMessage : state.error}</p>
        <ul className="photo-tips">
          <li>ถ่ายในที่มีแสงสว่าง และหลีกเลี่ยงเงาบังอุปกรณ์</li>
          <li>โฟกัสให้เห็นตัวถังและขาชัดเจน</li>
          <li>ใช้พื้นหลังเรียบและมีอุปกรณ์เพียงชิ้นเดียว</li>
        </ul>
        <p>เลือกภาพใหม่ หรือกดวิเคราะห์อีกครั้ง</p>
      </div>
    );
  if (!state.result)
    return (
      <div className="result-empty">
        <span className="result-empty-icon"><ScanLine size={35} strokeWidth={1.3} aria-hidden="true" /></span>
        <h3>รู้จักชิ้นส่วนจากภาพของคุณ</h3>
        <p>อัปโหลดภาพแล้วกดวิเคราะห์<br />ดูชื่ออุปกรณ์ หน้าที่ และวิธีต่อใช้งานได้ที่นี่</p>
        <span className="micro-label">แสดงผลเมื่อความมั่นใจมากกว่า 70%</span>
      </div>
    );
  const { top, predictions, source } = state.result;
  const isDemo = source === "demo";
  return (
    <div className="prediction-content" aria-live="polite">
      <div className={"result-source " + (isDemo ? "result-source-demo" : "result-source-real")}>
        {isDemo ? <FlaskConical size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
        <span>{isDemo ? "Demo / Sample Data" : "วิเคราะห์สำเร็จ · ผลจากโมเดลจริง"}</span>
      </div>
      {isDemo && <p className="mb-5 text-sm leading-7 text-amber-800">ข้อมูลตัวอย่างสำหรับดูรูปแบบหน้าจอ ไม่ใช่ผลวิเคราะห์ภาพที่อัปโหลด</p>}
      <div className="prediction-top">
        <div className="prediction-thumbnail"><AssetPlaceholder item={top.component} /></div>
        <div className="min-w-0">
          <p className="text-sm text-slate-500 mb-1">อุปกรณ์ที่พบ</p>
          <h3 className="break-words text-2xl font-semibold text-slate-900">{top.component.thaiName}</h3>
          <p className="mt-1 text-base text-slate-600">{top.className}</p>
        </div>
      </div>
      {!isDemo && top.coverageNote && <p className="alert alert-warning mt-4" role="note">{top.coverageNote}</p>}
      <div className="confidence-row"><span>ความมั่นใจของ AI</span><strong className="text-sky-700">{percent(top.percentage)}</strong></div>
      <div className="progress-track" role="progressbar" aria-label="คะแนนคลาสอันดับหนึ่ง" aria-valuenow={top.percentage} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: top.percentage + "%" }} className="bg-sky-500" />
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-500">คะแนนนี้บอกความมั่นใจของโมเดล ยังต้องตรวจเครื่องหมายและเบอร์อุปกรณ์จริงก่อนใช้งาน</p>
      {top.component.id === "resistor" && (
        <section id="resistor-tools" className="prediction-resistor" aria-label="คำนวณค่าตัวต้านทาน">
          <ResistorReader title="คำนวณค่าตัวต้านทาน" />
          <p className="mt-3 text-sm leading-7 text-slate-600">
            เลือกสีตามตัวต้านทานจริงจากซ้ายไปขวา AI ระบุประเภทอุปกรณ์ ส่วนค่า Ω คำนวณจากสีที่คุณเลือก
          </p>
        </section>
      )}
      <div className="prediction-info">
        <article><h4>อุปกรณ์นี้คืออะไร?</h4><p>{top.component.description}</p></article>
        <article><h4>หน้าที่หลัก</h4><p>{top.component.function}</p></article>
        <ConnectionGuide component={top.component} />
        <details className="result-more">
          <summary>หลักการทำงานและข้อมูลเพิ่มเติม</summary>
          <article><h4>หลักการทำงาน</h4><p>{top.component.principle}</p></article>
          <article><h4>ตัวอย่างการใช้งาน</h4><ul className="application-tags">{top.component.applications.map((item) => <li key={item}>{item}</li>)}</ul></article>
          {top.component.guide && <article><h4>ขาและขั้ว</h4><p>{top.component.guide.polarity}</p></article>}
        </details>
        <Link to={"/components?component=" + top.component.id} className="text-link mt-5">อ่านค่า ดูขา และคู่มือฉบับเต็ม <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div>
      <details className="probabilities">
        <summary>ดูคะแนนทั้ง 14 ประเภท <span>รายละเอียด AI</span></summary>
        <ol className="mt-4 space-y-4">
          {predictions.map((prediction, index) => (
            <li key={prediction.className}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className={index === 0 ? "font-semibold text-slate-800" : "text-slate-600"}>{prediction.component.thaiName}<span className="block text-xs text-slate-500">{prediction.className}</span></span>
                <span className="shrink-0 tabular-nums text-slate-600">{percent(prediction.percentage)}</span>
              </div>
              <div className="progress-track progress-track-small"><span className={index === 0 ? "bg-sky-500" : "bg-slate-300"} style={{ width: prediction.percentage + "%" }} /></div>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
