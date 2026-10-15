import { Link } from "react-router-dom";
import { CircuitBoard, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <CircuitBoard size={50} strokeWidth={1.2} aria-hidden="true" />
      <p className="eyebrow mt-6">404 · CONNECTION NOT FOUND</p>
      <h1>ไม่พบหน้าที่คุณต้องการ</h1>
      <p className="mt-4 text-slate-500">
        ตรวจสอบที่อยู่เว็บไซต์ หรือกลับไปเริ่มเรียนรู้ที่หน้าหลัก
      </p>
      <Link to="/" className="button-primary mt-7">
        <ArrowLeft size={17} aria-hidden="true" />
        กลับหน้า AI Recognition
      </Link>
    </div>
  );
}
