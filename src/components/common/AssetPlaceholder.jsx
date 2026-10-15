import {
  CircuitBoard,
  Cylinder,
  CircleDot,
  Lightbulb,
  Radio,
  ToggleLeft,
  Sun,
  PanelsTopLeft,
  SlidersHorizontal,
  Volume2,
  Thermometer,
  Gauge,
  Zap,
  Activity,
  Waves,
  Cpu,
} from "lucide-react";

const icons = {
  resistor: CircuitBoard,
  capacitor: Cylinder,
  diode: CircleDot,
  transistor: Cpu,
  led: Lightbulb,
  infrared: Radio,
  switch: ToggleLeft,
  light: Sun,
  display: PanelsTopLeft,
  dial: SlidersHorizontal,
  sound: Volume2,
  temperature: Thermometer,
  meter: Gauge,
  power: Zap,
  scope: Activity,
  wave: Waves,
};

export default function AssetPlaceholder({ item, large = false }) {
  const Icon = icons[item.icon] ?? CircuitBoard;
  return (
    <div
      className={`asset-placeholder ${large ? "asset-placeholder-large" : ""}`}
    >
      {item.image ? (
        <img
          src={item.image}
          alt={item.imageCredit?.caption ?? item.thaiName}
          loading="lazy"
          onError={(event) => {
            if (!event.currentTarget.dataset.fallback) {
              event.currentTarget.dataset.fallback = "true";
              event.currentTarget.src = "/images/placeholder.svg";
            }
          }}
        />
      ) : (
        <>
          <span className="asset-icon">
            <Icon size={large ? 48 : 34} strokeWidth={1.3} aria-hidden="true" />
          </span>
          <span className="asset-label">{item.name}</span>
          <span className="asset-note">พื้นที่สำหรับภาพอุปกรณ์</span>
        </>
      )}
    </div>
  );
}
