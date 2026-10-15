import { ArrowUpRight } from "lucide-react";
import AssetPlaceholder from "../common/AssetPlaceholder.jsx";

export default function EquipmentCard({ instrument, selected, onSelect }) {
  return (
    <button
      className={`catalog-card ${selected ? "catalog-card-selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`อ่านคู่มือ ${instrument.name}`}
    >
      <AssetPlaceholder item={instrument} />
      <div className="catalog-card-body">
        <span className="type-label">{instrument.tag}</span>
        <h2>{instrument.name}</h2>
        <p>{instrument.thaiName}</p>
        <span className="catalog-card-action">
          อ่านคู่มือ <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}
