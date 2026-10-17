import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, BookOpen, X, SearchX } from "lucide-react";
import PageHeader from "../components/common/PageHeader.jsx";
import ComponentCard from "../components/library/ComponentCard.jsx";
import ComponentDetails from "../components/library/ComponentDetails.jsx";
import { components } from "../data/components.js";

export default function ComponentsPage() {
  const [query, setQuery] = useState("");
  const [params, setParams] = useSearchParams();
  const detailRef = useRef(null);
  const selected = components.find(
    (component) => component.id === params.get("component"),
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = components.filter((component) =>
    `${component.name} ${component.thaiName}`
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );

  function select(component) {
    setParams({ component: component.id }, { preventScrollReset: true });
  }

  function closeDetails() {
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("component");
      return next;
    }, { preventScrollReset: true });
  }

  return (
    <>
      <PageHeader
        eyebrow="COMPONENTS LIBRARY"
        title="ชิ้นส่วนเล็ก ๆ ความรู้ที่ต่อยอดได้"
        description="ทำความรู้จักชิ้นส่วนอิเล็กทรอนิกส์ 14 ประเภท ตั้งแต่หน้าที่พื้นฐานไปจนถึงการใช้งานในวงจร"
      >
        <span className="status-badge status-blue">
          <BookOpen size={15} aria-hidden="true" />
          14 ประเภทพร้อมเรียนรู้
        </span>
      </PageHeader>
      <section aria-label="ค้นหาชิ้นส่วน" className="catalog-toolbar">
        <div className="search-input">
          <Search size={19} aria-hidden="true" />
          <label className="sr-only" htmlFor="component-search">
            ค้นหาชื่ออุปกรณ์ภาษาไทยหรืออังกฤษ
          </label>
          <input
            id="component-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาชื่ออุปกรณ์ ภาษาไทยหรืออังกฤษ…"
          />
          {query && (
            <button
              className="icon-button"
              onClick={() => setQuery("")}
              aria-label="ล้างคำค้น"
            >
              <X size={17} />
            </button>
          )}
        </div>
        <p aria-live="polite">
          แสดง <strong>{filtered.length}</strong> จาก 14 ประเภท
        </p>
      </section>
      {filtered.length ? (
        <div className="component-grid">
          {filtered.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              selected={selected?.id === component.id}
              onSelect={() => select(component)}
            />
          ))}
        </div>
      ) : (
        <div className="panel search-empty">
          <SearchX size={38} strokeWidth={1.4} aria-hidden="true" />
          <h2>ไม่พบชิ้นส่วนที่ค้นหา</h2>
          <p>ลองใช้ชื่อภาษาไทยหรืออังกฤษ เช่น ตัวต้านทาน หรือ Resistor</p>
          <button className="button-secondary" onClick={() => setQuery("")}>
            แสดงชิ้นส่วนทั้งหมด
          </button>
        </div>
      )}
      {selected && (
        <ComponentDetails key={selected.id} component={selected} detailRef={detailRef} onClose={closeDetails} />
      )}
    </>
  );
}
