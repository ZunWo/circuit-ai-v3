import {
  CheckCircle2,
  CircleDashed,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

const states = {
  "not-configured": {
    text: "ยังไม่ได้กำหนดโมเดล",
    english: "Model Not Configured",
    Icon: CircleDashed,
    tone: "neutral",
  },
  loading: {
    text: "กำลังโหลดโมเดล",
    english: "Loading Model",
    Icon: LoaderCircle,
    tone: "blue",
  },
  ready: {
    text: "โมเดลพร้อมใช้งาน",
    english: "Model Ready",
    Icon: CheckCircle2,
    tone: "green",
  },
  error: {
    text: "โหลดโมเดลไม่สำเร็จ",
    english: "Model Error",
    Icon: AlertCircle,
    tone: "red",
  },
};

export default function ModelStatus({ state }) {
  const { text, english, Icon, tone } = states[state.status];
  return (
    <span
      className={`status-badge status-${tone}`}
      role="status"
      title={english}
    >
      <Icon
        size={15}
        className={state.status === "loading" ? "animate-spin" : ""}
        aria-hidden="true"
      />
      {text}
    </span>
  );
}
