import { useEffect, useRef } from "react";
import { ArrowDown, Fingerprint, Cable, Lightbulb, X } from "lucide-react";
import AssetPlaceholder from "../common/AssetPlaceholder.jsx";
import ComponentGuide from "./ComponentGuide.jsx";
import ImageCredit from "../common/ImageCredit.jsx";
import { connections } from "../../data/connections.js";

export default function ComponentDetails({ component, detailRef, onClose }) {
  const localRef = useRef(null);
  const dialogRef = detailRef ?? localRef;
  const connection = connections[component.id];
  const overviewId = "overview-" + component.id;
  const guideId = "guide-" + component.id;
  const wiringId = "wiring-" + component.id;

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [dialogRef]);

  function dismiss() {
    dialogRef.current?.close();
    onClose();
  }

  function closeOnBackdrop(event) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom
    ) dismiss();
  }

  const sections = [
    { title: "วิธีสังเกต", Icon: Fingerprint, content: component.identification },
    { title: "ขั้วและจุดต่อ GND", Icon: Cable, content: component.guide?.polarity },
    { title: "วิธีต่อวงจร", Icon: Cable, content: connection?.title, link: wiringId },
    { title: "ตัวอย่างการใช้งาน", Icon: Lightbulb, applications: component.applications },
  ];

  return (
    <dialog
      className="panel component-detail component-dialog"
      id="component-details"
      ref={dialogRef}
      aria-labelledby="component-detail-title"
      onCancel={(event) => {
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        dismiss();
      }}
      onClick={closeOnBackdrop}
    >
      <header className="detail-dialog-header">
        <div className="min-w-0">
          <p className="eyebrow">{component.type} · COMPONENT GUIDE</p>
          <h2 id="component-detail-title">{component.name}</h2>
          <p className="detail-thai-name">{component.thaiName}</p>
        </div>
        <button type="button" className="detail-close" onClick={dismiss} aria-label="ปิดรายละเอียดชิ้นส่วน" autoFocus>
          <X size={22} aria-hidden="true" />
        </button>
      </header>
      <nav className="detail-section-nav" aria-label="หัวข้อข้อมูลอุปกรณ์">
        <a href={"#" + overviewId}>ภาพรวม</a>
        <a href={"#" + guideId}>ขาและการอ่านค่า</a>
        {component.id === "resistor" && <a href="#library-resistor-calculator">คำนวณค่าตัวต้านทาน</a>}
        <a href={"#" + wiringId}>วิธีต่อวงจร</a>
        <a href={"#sources-" + component.id}>เอกสารอ้างอิง</a>
      </nav>
      <div className="detail-dialog-body">
        <section className="detail-overview" id={overviewId} aria-label="ภาพและหน้าที่อุปกรณ์">
          <div className="detail-photo">
            <AssetPlaceholder item={component} large />
            <details className="detail-image-credit">
              <summary>เครดิตภาพ</summary>
              <ImageCredit credit={component.imageCredit} />
            </details>
          </div>
          <div className="detail-function">
            <span className="detail-label">หน้าที่</span>
            <p className="detail-function-main">{component.function}</p>
            <p>{component.description}</p>
            <details className="detail-principle">
              <summary>หลักการทำงาน</summary>
              <p>{component.principle}</p>
            </details>
          </div>
        </section>
        <div className="detail-summary-cards">
          {sections.map(({ title, Icon, content, link, applications }, index) => (
            <section className="detail-info-card" key={title}>
              <header>
                <span className="detail-card-number">{String(index + 1).padStart(2, "0")}</span>
                <h3><Icon size={18} aria-hidden="true" />{title}</h3>
              </header>
              {applications ? (
                <ul className="detail-applications">{applications.map((item) => <li key={item}>{item}</li>)}</ul>
              ) : (
                <p>{content}</p>
              )}
              {link && <a href={"#" + link} className="text-link mt-4">ดูภาพและจุดต่อสาย <ArrowDown size={15} aria-hidden="true" /></a>}
            </section>
          ))}
        </div>
        {component.extraImages?.length > 0 && (
          <div className="detail-extra-images">
            {component.extraImages.map((image) => (
              <figure className="extra-component-image" key={image.image}>
                <img src={image.image} alt={image.caption} loading="lazy" />
                <figcaption>{image.caption}</figcaption>
                <ImageCredit credit={image} />
              </figure>
            ))}
          </div>
        )}
        <ComponentGuide component={component} />
      </div>
    </dialog>
  );
}
