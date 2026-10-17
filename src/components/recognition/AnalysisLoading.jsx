import { useEffect, useId, useRef } from "react";
import { LoaderCircle, ScanLine, ShieldCheck } from "lucide-react";

export default function AnalysisLoading({ previewUrl }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <>
      <div className="result-empty" aria-hidden="true">
        <ScanLine size={36} /><p>กำลังประมวลผลภาพของคุณ…</p>
      </div>
      <dialog ref={dialogRef} className="analysis-loading" aria-labelledby={titleId} onCancel={(event) => event.preventDefault()}>
        <div role="status" aria-live="polite" aria-busy="true">
          <div className="analysis-scan-shell">
            <span className="analysis-orbit" aria-hidden="true" />
            <div className="analysis-scan">
              {previewUrl ? <img src={previewUrl} alt="" /> : <ScanLine size={64} aria-hidden="true" />}
              <span className="analysis-scan-line" aria-hidden="true" />
            </div>
          </div>
          <div className="analysis-loading-label"><LoaderCircle size={20} className="animate-spin" aria-hidden="true" /> AI กำลังประมวลผล</div>
          <h3 id={titleId}>กำลังวิเคราะห์ภาพ</h3>
          <p>กำลังตรวจลักษณะชิ้นส่วนและประเมินความมั่นใจ<br />กรุณารอสักครู่</p>
          <div className="analysis-progress" role="progressbar" aria-label="กำลังวิเคราะห์รูป"><span /></div>
          <p className="analysis-loading-privacy"><ShieldCheck size={16} aria-hidden="true" /> ประมวลผลบนอุปกรณ์ของคุณ</p>
        </div>
      </dialog>
    </>
  );
}
