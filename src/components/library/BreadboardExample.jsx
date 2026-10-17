import { useEffect, useId, useRef, useState } from "react";
import { Maximize2, X, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";

export default function BreadboardExample({
  diagram,
  isBreadboard = false,
  step,
  focused = true,
  onToggleFocus,
  caption = "ดูตำแหน่งที่เสียบบน breadboard",
  note = "รู A–E ในคอลัมน์เดียวกันเชื่อมถึงกัน ส่วน F–J เชื่อมถึงกันอีกฝั่ง ภาพเป็นตัวอย่าง ต้องตรวจขาของรุ่นจริงก่อนเสียบ",
}) {
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const dialogRef = useRef(null);
  const zoomRef = useRef(null);
  const titleId = useId();
  useEffect(() => {
    if (!expanded) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);
  useEffect(() => {
    setZoom(1);
    zoomRef.current?.scrollTo(0, 0);
  }, [step?.index, focused, expanded]);
  const focusControl = isBreadboard && step?.index !== null && onToggleFocus && (
    <button type="button" onClick={onToggleFocus} aria-pressed={!focused}>
      {focused ? "แสดงทั้งบอร์ด" : "ขยายเฉพาะสายนี้"}
    </button>
  );
  const dialogTitle = isBreadboard ? "ภาพตัวอย่างการต่อบน breadboard" : "ภาพตัวอย่างการต่อสาย";
  return (
    <figure className="breadboard-example">
      <figcaption>
        <strong>{caption}</strong>
        <button type="button" onClick={() => setExpanded(true)}>
          <Maximize2 size={16} aria-hidden="true" /> ขยายภาพ
        </button>
      </figcaption>
      {focusControl && <div className="breadboard-scope">{focusControl}</div>}
      <div className="breadboard-preview">{diagram}</div>
      <p>{note}</p>
      <dialog ref={dialogRef} className="breadboard-dialog" aria-labelledby={titleId} onClose={(event) => { event.stopPropagation(); setExpanded(false); }} onCancel={(event) => { event.stopPropagation(); setExpanded(false); }}>
        <header>
          <h2 id={titleId}>{dialogTitle}</h2>
          <button type="button" className="icon-button" onClick={() => setExpanded(false)} aria-label="ปิดภาพขยาย"><X size={22} /></button>
        </header>
        <div className="breadboard-tools" aria-label="ปรับขนาดภาพ">
          <button type="button" onClick={() => setZoom(Math.max(1, zoom - 0.5))} disabled={zoom === 1} aria-label="ย่อภาพ"><Minus size={18} /></button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom(Math.min(3, zoom + 0.5))} disabled={zoom === 3} aria-label="ขยายอีก"><Plus size={18} /></button>
          <button type="button" onClick={() => { setZoom(1); zoomRef.current?.scrollTo(0, 0); }}>พอดีหน้าจอ</button>
          {focusControl}
        </div>
        {step && <div className="breadboard-dialog-step" role="status" aria-live="polite">
          {step.index === null ? <strong>ภาพรวมทุกสาย</strong> : <>
            <strong>สายที่ {step.index + 1} / {step.count}</strong>
            <div><span>จาก <b>{step.from}</b></span><span aria-hidden="true">→</span><span>ไป <b>{step.to}</b></span></div>
          </>}
        </div>}
        <div ref={zoomRef} className="breadboard-zoom" role="region" aria-label="ภาพขยาย เลื่อนซ้ายขวาเพื่อดูทั้งหมด" tabIndex={0}>
          <div className="breadboard-canvas" data-fit={zoom === 1} style={{ width: (zoom * 100) + "%" }}>{expanded && diagram}</div>
        </div>
        {step && <div className="wire-step-navigation breadboard-dialog-navigation">
          <button type="button" aria-label="สายก่อนหน้า" disabled={step.index === null || step.index === 0} onClick={() => step.onChange(step.index - 1)}><ChevronLeft size={18} /> ก่อนหน้า</button>
          <button type="button" onClick={() => step.onChange(step.index === null ? 0 : null)}>{step.index === null ? "เริ่มสายแรก" : "ดูทุกสาย"}</button>
          <button type="button" aria-label="สายถัดไป" disabled={step.index === null || step.index === step.count - 1} onClick={() => step.onChange(step.index + 1)}>ถัดไป <ChevronRight size={18} /></button>
        </div>}
        <p>ตรวจชื่อขาและผังขาของรุ่นจริงก่อนเปิดไฟ</p>
      </dialog>
    </figure>
  );
}
