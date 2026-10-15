import { useRef, useState } from "react";
import {
  Gauge,
  SlidersHorizontal,
  ShieldAlert,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";
import PageHeader from "../components/common/PageHeader.jsx";
import EquipmentCard from "../components/equipment/EquipmentCard.jsx";
import AssetPlaceholder from "../components/common/AssetPlaceholder.jsx";
import ImageCredit from "../components/common/ImageCredit.jsx";
import { equipment } from "../data/equipment.js";

export default function EquipmentPage() {
  const [selectedId, setSelectedId] = useState(equipment[0].id);
  const detailRef = useRef(null);
  const selected = equipment.find((instrument) => instrument.id === selectedId);
  function select(instrument) {
    setSelectedId(instrument.id);
    requestAnimationFrame(() => {
      detailRef.current?.focus({ preventScroll: true });
      detailRef.current?.scrollIntoView({
        behavior: "instant",
        block: "start",
      });
    });
  }
  return (
    <>
      <PageHeader
        eyebrow="MEASUREMENT EQUIPMENT GUIDE"
        title="เข้าใจเครื่องมือ ก่อนเริ่มทดลอง"
        description="คู่มือพื้นฐานสำหรับเครื่องมือวัดในห้องปฏิบัติการ เรียนรู้การตั้งค่า การใช้งาน และข้อควรระวัง"
      >
        <span className="status-badge status-blue">
          <Gauge size={15} aria-hidden="true" />4 คู่มือเครื่องมือวัด
        </span>
      </PageHeader>
      <div className="equipment-grid">
        {equipment.map((instrument) => (
          <EquipmentCard
            key={instrument.id}
            instrument={instrument}
            selected={selected.id === instrument.id}
            onSelect={() => select(instrument)}
          />
        ))}
      </div>
      <section
        className="panel equipment-detail"
        ref={detailRef}
        tabIndex={-1}
        aria-labelledby="equipment-detail-title"
      >
        <div className="equipment-intro">
          <AssetPlaceholder item={selected} large />
          <ImageCredit credit={selected.imageCredit} />
          <span className="eyebrow">LAB ESSENTIALS</span>
          <h2 id="equipment-detail-title">{selected.name}</h2>
          <p className="mt-1 text-slate-500">{selected.thaiName}</p>
          <p className="mt-5 text-sm leading-7 text-slate-600">
            {selected.introduction}
          </p>
          <div className="purpose-block">
            <h3>ใช้ทำอะไร?</h3>
            <p>{selected.purpose}</p>
          </div>
          <h3 className="detail-subtitle">
            <SlidersHorizontal size={18} aria-hidden="true" />
            การตั้งค่าและส่วนควบคุม
          </h3>
          <ul className="controls-list">
            {selected.controls.map((control) => (
              <li key={control}>{control}</li>
            ))}
          </ul>
          <p className="mt-6 text-xs leading-6 text-slate-500">
            เครื่องมือทั้ง 4 ชนิดเป็นเนื้อหาการเรียนรู้ ไม่รวมอยู่ใน 14 คลาสของ
            AI
          </p>
        </div>
        <div className="equipment-instructions">
          <h3 className="detail-subtitle">
            <BookOpen size={18} aria-hidden="true" />
            ขั้นตอนการใช้งานเบื้องต้น
          </h3>
          <ol className="instruction-list">
            {selected.steps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <div className="safety-block">
            <h3>
              <ShieldAlert size={19} aria-hidden="true" />
              ข้อควรระวัง
            </h3>
            <ul>
              {selected.safety.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
          <div className="guide-sources">
            <p>อ่านคู่มือของเครื่องรุ่นที่ใช้งานก่อนทดลอง</p>
            {selected.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                {source.title}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
