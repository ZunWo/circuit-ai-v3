import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ScanLine,
  ShieldCheck,
  ArrowUpRight,
  FlaskConical,
  LoaderCircle,
  Info,
  RefreshCw,
  ImagePlus,
  Cpu,
  BookOpen,
} from "lucide-react";
import PageHeader from "../components/common/PageHeader.jsx";
import ImageUploader from "../components/upload/ImageUploader.jsx";
import ModelStatus from "../components/recognition/ModelStatus.jsx";
import PredictionResult from "../components/recognition/PredictionResult.jsx";
import { useRecognition } from "../hooks/useRecognition.js";

export default function RecognitionPage() {
  const [upload, setUpload] = useState(null);
  const {
    modelState,
    predictionState,
    analyze,
    showDemo,
    resetPrediction,
    retryModel,
  } = useRecognition();
  const analyzing = predictionState.status === "analyzing";
  const canAnalyze =
    modelState.status === "ready" && Boolean(upload) && !analyzing;

  useEffect(
    () => () => {
      if (upload) URL.revokeObjectURL(upload.url);
    },
    [upload],
  );

  function changeImage(nextUpload) {
    resetPrediction();
    setUpload(nextUpload);
  }

  return (
    <>
      <PageHeader
        eyebrow="YOUR ELECTRONICS LEARNING LAB"
        title="รู้จักชิ้นส่วน เริ่มต้นจากภาพ"
        description="จำแนกชิ้นส่วนอิเล็กทรอนิกส์ด้วย AI แล้วเรียนรู้หน้าที่และหลักการทำงานไปพร้อมกัน"
      >
        <ModelStatus state={modelState} />
        <p className="mt-2 text-xs text-slate-400">
          Teachable Machine · Browser-based AI
        </p>
      </PageHeader>
      {modelState.coverageNotes?.length > 0 && (
        <div className="alert alert-warning mb-6" role="note">
          <Info size={18} aria-hidden="true" />
          <span>{modelState.coverageNotes.join(" ")}</span>
        </div>
      )}
      <div className="recognition-grid">
        <section className="panel upload-panel" aria-labelledby="upload-title">
          <div className="panel-heading">
            <div className="flex items-center gap-3">
              <span className="step-marker">01</span>
              <div>
                <h2 id="upload-title">อัปโหลดรูปภาพ</h2>
                <p>ภาพหนึ่งภาพ ชิ้นส่วนหนึ่งชิ้น</p>
              </div>
            </div>
            <ImagePlus
              size={20}
              className="text-slate-400"
              aria-hidden="true"
            />
          </div>
          <div className="panel-body">
            <ImageUploader
              upload={upload}
              onImageChange={changeImage}
              disabled={analyzing}
            />
            <div className="analysis-actions">
              <button
                className="button-primary flex-1"
                onClick={() => void analyze(upload)}
                disabled={!canAnalyze}
              >
                {analyzing ? (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <ScanLine size={18} aria-hidden="true" />
                )}
                {analyzing ? "กำลังวิเคราะห์…" : "วิเคราะห์ภาพ (Analyze Image)"}
              </button>
              <button
                className="button-secondary"
                onClick={showDemo}
                disabled={analyzing}
              >
                <FlaskConical size={17} aria-hidden="true" />
                ดูผลลัพธ์ตัวอย่าง (Demo)
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {modelState.status === "not-configured"
                ? "ปุ่มวิเคราะห์จะพร้อมใช้งานเมื่อเชื่อมต่อโมเดลจริง"
                : modelState.status === "loading"
                  ? "กำลังดาวน์โหลดโมเดล กรุณารอสักครู่"
                  : modelState.status === "error"
                    ? "กรุณาแก้ไขการโหลดโมเดลก่อนวิเคราะห์ภาพ"
                    : !upload
                      ? "เลือกรูปภาพเพื่อเริ่มวิเคราะห์ด้วยโมเดลจริง"
                      : "พร้อมวิเคราะห์ภาพด้วยโมเดลที่โหลดแล้ว"}
            </p>
          </div>
          <div className="privacy-note">
            <ShieldCheck size={17} aria-hidden="true" />
            <span>ภาพอยู่บนอุปกรณ์ของคุณ ไม่มีการส่งภาพไปยังเซิร์ฟเวอร์</span>
          </div>
        </section>
        <section className="panel result-panel" aria-labelledby="result-title">
          <div className="panel-heading">
            <div className="flex items-center gap-3">
              <span className="step-marker">02</span>
              <div>
                <h2 id="result-title">ผลการจำแนก</h2>
                <p>Prediction & component insights</p>
              </div>
            </div>
            <span className="small-tag">14 คลาส</span>
          </div>
          <PredictionResult state={predictionState} />
        </section>
      </div>
      {modelState.status === "error" && (
        <div className="alert alert-error mt-5" role="alert">
          <Info size={20} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Model Error</p>
            <p className="mt-1 break-words">{modelState.error}</p>
          </div>
          <button className="button-secondary shrink-0" onClick={retryModel}>
            <RefreshCw size={16} aria-hidden="true" />
            ลองโหลดใหม่
          </button>
        </div>
      )}
      {modelState.status === "not-configured" && (
        <div className="model-notice">
          <span className="notice-icon">
            <Info size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2>พร้อมเชื่อมต่อโมเดลของคุณ</h2>
            <p>
              ระบบเชื่อม AI ถูกเตรียมไว้แล้ว ขณะนี้ยังไม่มีโมเดลที่ฝึกครบ 14
              คลาส ลองดูผล Demo เพื่อสำรวจหน้าจอได้
            </p>
            <details className="setup-details">
              <summary>วิธีเชื่อมต่อโมเดลจริง</summary>
              <div>
                <p>
                  สร้างไฟล์ <code>.env.local</code> ในโฟลเดอร์โครงการ แล้วกำหนด{" "}
                  <code>VITE_TM_MODEL_URL</code> เป็น URL โฟลเดอร์โมเดลที่
                  Export จาก Teachable Machine หรือ{" "}
                  <code>/models/my-model/</code> เมื่อใช้ไฟล์ในเครื่อง จากนั้น
                  restart Vite
                </p>
                <p className="mt-2">
                  ดูขั้นตอน Dataset, การฝึก และการทดสอบได้ใน{" "}
                  <code>docs/model-guide.md</code>{" "}
                  โมเดลต้องมีชื่อคลาสตรงกับเว็บไซต์ครบ 14 คลาส
                </p>
                <a
                  className="text-link mt-3"
                  href="https://teachablemachine.withgoogle.com/train/image"
                  target="_blank"
                  rel="noreferrer"
                >
                  เปิด Teachable Machine{" "}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            </details>
          </div>
        </div>
      )}
      <section
        className="getting-started"
        aria-labelledby="getting-started-title"
      >
        <div className="section-heading">
          <h2 id="getting-started-title">จากภาพ สู่ความเข้าใจ</h2>
          <p>สามขั้นตอนง่าย ๆ สำหรับการเรียนรู้อิเล็กทรอนิกส์</p>
        </div>
        <div className="learning-steps">
          <article>
            <ImagePlus size={23} aria-hidden="true" />
            <div>
              <h3>เลือกภาพที่ชัดเจน</h3>
              <p>ใช้พื้นหลังเรียบ ถ่ายให้เห็นตัวถังและขาอุปกรณ์</p>
            </div>
          </article>
          <article>
            <Cpu size={23} aria-hidden="true" />
            <div>
              <h3>วิเคราะห์ด้วยโมเดลจริง</h3>
              <p>ตรวจอันดับและคะแนนประกอบการพิจารณา</p>
            </div>
          </article>
          <article>
            <BookOpen size={23} aria-hidden="true" />
            <div>
              <h3>เรียนรู้เพิ่มเติม</h3>
              <Link to="/components" className="text-link">
                สำรวจคลังชิ้นส่วนทั้ง 14 ประเภท{" "}
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
