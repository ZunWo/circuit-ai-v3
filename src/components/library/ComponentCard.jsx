import { ArrowUpRight } from "lucide-react";
import AssetPlaceholder from "../common/AssetPlaceholder.jsx";

export default function ComponentCard({ component, selected, onSelect }) {
  return (
    <button
      className={`catalog-card ${selected ? "catalog-card-selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`ดูรายละเอียด ${component.name} ${component.thaiName}`}
    >
      <AssetPlaceholder item={component} />
      <div className="catalog-card-body">
        <span className="type-label">{component.type}</span>
        <h2>{component.name}</h2>
        <p>{component.thaiName}</p>
        <span className="catalog-card-action">
          ดูรายละเอียด <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}
