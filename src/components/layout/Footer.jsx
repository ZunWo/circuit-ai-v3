import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <span className="inline-flex items-center gap-2 font-semibold text-slate-600">
          <img src="/circuitlib-logo.svg" alt="" width="24" height="24" />
          <span className="brand-name">CIRCUIT<span className="brand-accent">LIB</span></span>{" "}
          <span className="font-normal text-slate-400">
            · เรียนรู้ ทดลอง เข้าใจ
          </span>
        </span>
        <a
          href="/images/credits.html"
          target="_blank"
          rel="noreferrer"
          className="text-slate-500 hover:text-sky-700 hover:underline"
        >
          เครดิตภาพอุปกรณ์
        </a>
        <span className="inline-flex items-center gap-2">
          <ShieldCheck size={16} aria-hidden="true" />{" "}
          ภาพของคุณประมวลผลในเบราว์เซอร์
        </span>
      </div>
    </footer>
  );
}
