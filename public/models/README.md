# Local Teachable Machine models

ยังไม่มีโมเดลในโครงการนี้ ใส่โมเดล TensorFlow.js ที่ Export จริงในโฟลเดอร์ย่อย เช่น `public/models/my-model/`

ต้องมี `model.json`, `metadata.json` และ weights ทุกไฟล์ที่ `model.json` อ้างถึง โดยรักษาชื่อไฟล์และพาธเดิม

ตั้ง `VITE_TM_MODEL_URL=/models/my-model/` ใน `.env.local` แล้ว restart Vite หรือ build ใหม่

อย่าใช้ README นี้เป็น Model URL ดูคู่มือภาษาไทยฉบับเต็มที่ `docs/model-guide.md`

