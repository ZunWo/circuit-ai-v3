import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  ImagePlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import { decodeImage, validateImageFile } from "../../services/image.js";

export default function ImageUploader({ upload, onImageChange, disabled }) {
  const inputRef = useRef(null);
  const sequence = useRef(0);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () => () => {
      sequence.current += 1;
    },
    [],
  );

  async function acceptFiles(files) {
    if (disabled || !files?.length) return;
    if (files.length !== 1) {
      setError("กรุณาเลือกภาพครั้งละหนึ่งไฟล์");
      return;
    }
    const file = files[0];
    try {
      validateImageFile(file);
    } catch (validationError) {
      setError(validationError.message);
      return;
    }
    const id = ++sequence.current;
    setError("");
    setReading(true);
    onImageChange(null);
    const url = URL.createObjectURL(file);
    let transferred = false;
    try {
      const decoded = await decodeImage(url);
      if (id !== sequence.current) return;
      onImageChange({
        file,
        url,
        width: decoded.naturalWidth,
        height: decoded.naturalHeight,
      });
      transferred = true;
    } catch (decodeError) {
      if (id === sequence.current) setError(decodeError.message);
    } finally {
      if (!transferred) URL.revokeObjectURL(url);
      if (id === sequence.current) setReading(false);
    }
  }

  function preventDrag(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function removeImage() {
    sequence.current += 1;
    setError("");
    setReading(false);
    onImageChange(null);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="เลือกภาพชิ้นส่วนอิเล็กทรอนิกส์"
        disabled={disabled || reading}
        onChange={(event) => {
          void acceptFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <div
        className={`upload-zone ${dragging ? "upload-zone-dragging" : ""} ${upload ? "upload-zone-filled" : ""}`}
        onDragEnter={(event) => {
          preventDrag(event);
          if (!disabled && !reading) {
            dragDepth.current += 1;
            setDragging(true);
          }
        }}
        onDragOver={preventDrag}
        onDragLeave={(event) => {
          preventDrag(event);
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (!dragDepth.current) setDragging(false);
        }}
        onDrop={(event) => {
          preventDrag(event);
          dragDepth.current = 0;
          setDragging(false);
          if (!reading) void acceptFiles(event.dataTransfer.files);
        }}
      >
        {upload ? (
          <div className="preview-container">
            <img
              src={upload.url}
              alt={`ภาพที่เลือก: ${upload.file.name}`}
              className="image-preview"
            />
          </div>
        ) : (
          <div className="upload-empty">
            <div className="upload-icon">
              {reading ? (
                <LoaderCircle
                  className="animate-spin"
                  size={30}
                  aria-hidden="true"
                />
              ) : (
                <UploadCloud size={30} strokeWidth={1.6} aria-hidden="true" />
              )}
            </div>
            <h3>
              {reading
                ? "กำลังอ่านภาพ…"
                : dragging
                  ? "วางภาพที่นี่"
                  : "เริ่มต้นด้วยภาพชิ้นส่วนของคุณ"}
            </h3>
            <p>ลากและวางภาพที่นี่ หรือเลือกไฟล์จากอุปกรณ์</p>
            <button
              className="button-primary"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || reading}
            >
              <ImagePlus size={17} aria-hidden="true" /> เลือกรูปภาพ
            </button>
            <span className="upload-formats">
              JPG, PNG, WebP · ขนาดสูงสุด 10 MB
            </span>
          </div>
        )}
      </div>
      {upload && (
        <div className="uploaded-file">
          <CheckCircle2
            size={18}
            className="shrink-0 text-emerald-600"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-slate-700">
              {upload.file.name}
            </p>
            <p className="text-xs text-slate-500">
              {upload.width} × {upload.height} px ·{" "}
              {(upload.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            className="icon-button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || reading}
            aria-label="เปลี่ยนรูปภาพ"
          >
            <ImagePlus size={18} />
          </button>
          <button
            className="icon-button text-rose-600"
            onClick={removeImage}
            disabled={disabled}
            aria-label="ลบรูปภาพ"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
      {error && (
        <p className="alert alert-error mt-3" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      <p className="mt-4 text-xs leading-6 text-slate-500">
        เลือกภาพที่มีชิ้นส่วนหลักเพียง 1 ชิ้น ให้เห็นอุปกรณ์ชัดและมีแสงเพียงพอ
      </p>
    </div>
  );
}
