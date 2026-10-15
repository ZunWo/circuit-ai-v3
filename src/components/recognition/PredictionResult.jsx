import { Link } from "react-router-dom";
import {
  ScanLine,
  ArrowUpRight,
  AlertTriangle,
  AlertCircle,
  LoaderCircle,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";
import { aiConfig } from "../../config/aiConfig.js";
import AssetPlaceholder from "../common/AssetPlaceholder.jsx";

const percent = (value) => `${value.toFixed(1)}%`;

export default function PredictionResult({ state }) {
  if (state.status === "analyzing")
    return (
      <div className="result-empty" role="status" aria-busy="true">
        <span className="result-empty-icon">
          <LoaderCircle size={32} className="animate-spin" />
        </span>
        <h3>กำลังวิเคราะห์ภาพ</h3>
        <p>โมเดลกำลังประมวลผลบนอุปกรณ์ของคุณ</p>
        <span className="micro-label">ANALYZING IMAGE</span>
      </div>
    );
  if (state.status === "error")
    return (
      <div className="result-empty" role="alert">
        <span className="result-empty-icon text-rose-600">
          <AlertCircle size={32} />
        </span>
        <h3>วิเคราะห์ภาพไม่สำเร็จ</h3>
        <p className="break-words">{state.error}</p>
        <p>ลองเลือกภาพใหม่แล้วกดวิเคราะห์อีกครั้ง</p>
        <span className="micro-label">PREDICTION ERROR</span>
      </div>
    );
  if (!state.result)
    return (
      <div className="result-empty">
        <span className="result-empty-icon">
          <ScanLine size={35} strokeWidth={1.3} />
        </span>
        <h3>รู้จักชิ้นส่วนจากภาพของคุณ</h3>
        <p>
          ผลการจำแนกและข้อมูลอุปกรณ์
          <br />
          จะแสดงที่นี่เมื่อวิเคราะห์สำเร็จ
        </p>
        <span className="micro-label">WAITING FOR A RESULT</span>
      </div>
    );
  const { top, predictions, source } = state.result;
  const isDemo = source === "demo";
  const lowConfidence = top.probability < aiConfig.confidenceThreshold;
  return (
    <div className="prediction-content" aria-live="polite">
      <div
        className={`result-source ${isDemo ? "result-source-demo" : "result-source-real"}`}
      >
        {isDemo ? (
          <FlaskConical size={16} aria-hidden="true" />
        ) : (
          <CheckCircle2 size={16} aria-hidden="true" />
        )}
        <span>
          {isDemo
            ? "Demo / Sample Data"
            : "ผลจากโมเดลจริง · Analysis Completed"}
        </span>
      </div>
      {isDemo && (
        <p className="mb-5 text-xs leading-6 text-amber-800">
          ข้อมูลตัวอย่างสำหรับดูรูปแบบหน้าจอ ไม่ใช่ผลวิเคราะห์ภาพที่อัปโหลด
        </p>
      )}
      <div className="prediction-top">
        <div className="prediction-thumbnail">
          <AssetPlaceholder item={top.component} />
        </div>
        <div className="min-w-0">
          <p className="micro-label mb-1">
            {isDemo ? "SAMPLE COMPONENT" : "TOP PREDICTION"}
          </p>
          <h3 className="break-words text-xl font-semibold text-slate-900">
            {top.className}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {top.component.thaiName}
          </p>
        </div>
      </div>
      {!isDemo && top.modelClassName !== top.className && (
        <p className="mt-3 text-xs text-slate-500">
          ชื่อคลาสจากโมเดล: {top.modelClassName}
        </p>
      )}
      {!isDemo && top.coverageNote && (
        <p className="alert alert-warning mt-4" role="note">
          {top.coverageNote}
        </p>
      )}
      <div className="confidence-row">
        <span>Model confidence</span>
        <strong className={lowConfidence ? "text-amber-700" : "text-sky-700"}>
          {percent(top.percentage)}
        </strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="คะแนนคลาสอันดับหนึ่ง"
        aria-valuenow={top.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          style={{ width: `${top.percentage}%` }}
          className={lowConfidence ? "bg-amber-500" : "bg-sky-500"}
        />
      </div>
      {lowConfidence && (
        <div className="alert alert-warning mt-4" role="status">
          <AlertTriangle size={18} aria-hidden="true" />
          <span>
            คะแนนต่ำกว่า {(aiConfig.confidenceThreshold * 100).toFixed(0)}%
            ผลอาจไม่แน่นอน ลองใช้ภาพที่ชัดขึ้นและมีชิ้นส่วนเพียงชิ้นเดียว
          </span>
        </div>
      )}
      <p className="mt-3 text-xs leading-5 text-slate-500">
        คะแนน Softmax เป็นความมั่นใจของโมเดล ไม่ใช่ค่าความแม่นยำที่ผ่านการทดสอบ
        และไม่ได้ยืนยันว่าภาพอยู่ใน 14 หมวด
      </p>
      <div className="prediction-info">
        <p>{top.component.description}</p>
        <p className="mt-3">
          <strong>หน้าที่หลัก</strong> · {top.component.function}
        </p>
        <p className="mt-3">
          <strong>หลักการทำงาน</strong> · {top.component.principle}
        </p>
        <p className="mt-3">
          <strong>การใช้งาน</strong> · {top.component.applications.join(" · ")}
        </p>
        {top.component.guide && (
          <p className="mt-3">
            <strong>ขา / ขั้ว</strong> · {top.component.guide.polarity}
          </p>
        )}
        <Link
          to={`/components?component=${top.component.id}`}
          className="text-link mt-4"
        >
          ดูข้อมูลอุปกรณ์เพิ่มเติม <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <details className="probabilities" open>
        <summary>
          ความน่าจะเป็นทุกคลาส <span>14 classes</span>
        </summary>
        <ol className="mt-4 space-y-3">
          {predictions.map((prediction, index) => (
            <li key={prediction.className}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span
                  className={
                    index === 0
                      ? "font-semibold text-slate-800"
                      : "text-slate-600"
                  }
                >
                  {prediction.className}
                  {prediction.coverageNote && !isDemo && (
                    <span className="block mt-1 text-[10px] text-amber-800">
                      คลาสนี้ฝึกเฉพาะ Photo transistor
                    </span>
                  )}
                </span>
                <span className="shrink-0 tabular-nums text-slate-500">
                  {percent(prediction.percentage)}
                </span>
              </div>
              <div className="progress-track progress-track-small">
                <span
                  className={index === 0 ? "bg-sky-500" : "bg-slate-300"}
                  style={{ width: `${prediction.percentage}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
