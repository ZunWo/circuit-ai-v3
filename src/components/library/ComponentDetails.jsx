import { CircuitBoard, Fingerprint, Lightbulb, Workflow } from "lucide-react";
import AssetPlaceholder from "../common/AssetPlaceholder.jsx";
import ComponentGuide from "./ComponentGuide.jsx";
import ImageCredit from "../common/ImageCredit.jsx";

export default function ComponentDetails({ component, detailRef }) {
  const fields = [
    { title: "หน้าที่หลัก", text: component.function, Icon: CircuitBoard },
    { title: "หลักการทำงาน", text: component.principle, Icon: Workflow },
    {
      title: "ลักษณะที่ใช้สังเกต",
      text: component.identification,
      Icon: Fingerprint,
    },
  ];
  return (
    <section
      className="panel component-detail"
      id="component-details"
      ref={detailRef}
      tabIndex={-1}
      aria-labelledby="component-detail-title"
    >
      <div className="detail-overview">
        <AssetPlaceholder item={component} large />
        <ImageCredit credit={component.imageCredit} />
        {component.extraImages?.map((image) => (
          <figure className="extra-component-image" key={image.image}>
            <img src={image.image} alt={image.caption} loading="lazy" />
            <figcaption>{image.caption}</figcaption>
            <ImageCredit credit={image} />
          </figure>
        ))}
        <span className="type-label mt-5">{component.type}</span>
        <h2
          id="component-detail-title"
          className="mt-2 break-words text-2xl font-semibold"
        >
          {component.name}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{component.thaiName}</p>
        <p className="mt-5 text-sm leading-7 text-slate-600">
          {component.description}
        </p>
        <div className="mt-5 border-t border-slate-200 pt-4 text-xs leading-6 text-slate-500">
          รูปลักษณ์ช่วยจำแนกเบื้องต้น พิกัดไฟฟ้าและลำดับขาต้องตรวจจากรหัสรุ่นและ
          datasheet
        </div>
      </div>
      <div className="detail-sections">
        {fields.map(({ title, text, Icon }) => (
          <article key={title}>
            <h3>
              <Icon size={18} aria-hidden="true" />
              {title}
            </h3>
            <p>{text}</p>
          </article>
        ))}
        <article>
          <h3>
            <Lightbulb size={18} aria-hidden="true" />
            ตัวอย่างการใช้งาน
          </h3>
          <ul className="application-tags">
            {component.applications.map((application) => (
              <li key={application}>{application}</li>
            ))}
          </ul>
        </article>
      </div>
      <ComponentGuide component={component} />
    </section>
  );
}
