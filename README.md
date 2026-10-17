# CircuitLib

เว็บไซต์เรียนรู้และจำแนกชิ้นส่วนอิเล็กทรอนิกส์ด้วย Google Teachable Machine ในเบราว์เซอร์

**สถานะ AI: เชื่อมโมเดลจริงแล้ว ผ่าน runtime และการกด Analyze ในเว็บ** ผู้ใช้ให้ Model URL `https://teachablemachine.withgoogle.com/models/mZNDylZHP/` และตั้งไว้ใน `.env.local` แล้ว ยังไม่ได้รับ Dataset หรือภาพชิ้นส่วนที่มีคำตอบจริง จึงยังไม่มี Accuracy/Confusion Matrix ที่ยืนยันได้

โมเดลมี output 14 คลาส โดยผู้ใช้ยืนยันว่า `phototransistor` ฝึกเฉพาะ Photo transistor ไม่รวม IR LED เว็บแสดงข้อจำกัดนี้และยังคงหมวดการเรียนรู้เดิมครบ 14 ประเภท

## Architecture

React SPA ใช้ React Router ครบ 3 หน้าหลัก: `/`, `/components`, `/equipment` พร้อม Not Found สำหรับ URL อื่น

ภาพผ่านการตรวจไฟล์และ decode ในเบราว์เซอร์ ก่อนส่ง `HTMLImageElement` ให้ `model.predict()` โมเดลถูกดาวน์โหลดผ่าน HTTP(S) และ cache ให้ใช้ซ้ำ ไม่มี application backend, database, authentication หรือการส่งภาพออกไปประมวลผลบน server

- UI: React JSX, Tailwind CSS v4 ผ่าน official Vite plugin, Lucide React
- AI: `@teachablemachine/image` + TensorFlow.js
- State: React Hooks แยก upload, model state และ prediction state
- Content: ข้อมูลภาษาไทยใน JavaScript พร้อมชื่อ classification ภาษาอังกฤษตรงตาม Scope
- Config: `src/config/aiConfig.js` อ่านค่าจาก Vite environment
- ทดสอบ: Node test runner และ Playwright เฉพาะฝั่งพัฒนา

## โครงสร้างไฟล์

```text
circuit-ai-v3/
├── public/
│   ├── images/           # components/, equipment/, credits.html และ placeholder.svg
│   ├── theme.js          # ใช้โหมดที่บันทึกไว้ก่อนแสดงหน้าเว็บ
│   └── models/README.md
├── src/
│   ├── components/
│   │   ├── common/       # PageHeader, AssetPlaceholder, ImageCredit
│   │   ├── layout/       # Navbar, Footer
│   │   ├── upload/       # ImageUploader
│   │   ├── recognition/  # ModelStatus, PredictionResult
│   │   ├── library/      # ComponentCard, ComponentDetails, ComponentGuide, ResistorReader
│   │   └── equipment/    # EquipmentCard
│   ├── pages/            # Recognition, Components, Equipment, NotFound
│   ├── hooks/            # useRecognition.js, useTheme.js
│   ├── services/
│   │   ├── teachableMachine.js
│   │   └── image.js
│   ├── config/aiConfig.js
│   ├── data/
│   │   ├── components.js
│   │   ├── equipment.js
│   │   ├── imageCredits.js # แหล่งภาพ ผู้สร้าง และสัญญาอนุญาต
│   │   └── mockPredictions.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── docs/model-guide.md
├── scripts/fetch-component-images.mjs # ค้นหา/ดาวน์โหลดภาพที่ตรวจสิทธิ์แล้ว
├── tests/
│   ├── recognition.test.js
│   ├── model-connection.mjs # Real-model runtime / application smoke test
│   └── browser/          # UI tests, learning.spec.js และ test harnesses
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── playwright.config.js
└── README.md
```

`node_modules`, `dist` และ `test-results` เป็นผลจากการติดตั้ง/build/ทดสอบ ไม่ใช่ไฟล์ source และถูก ignore

## Dependencies และความเข้ากันได้

| แพ็กเกจ | เวอร์ชันที่ติดตั้ง | เหตุผล |
|---|---|---|
| react / react-dom | 19.3.0 | UI |
| react-router-dom | 7.18.4 | Navigation โดยไม่ reload หน้า |
| lucide-react | 1.57.0 | ไอคอน |
| @teachablemachine/image | 0.8.5 | API โหลดและประมวลผลโมเดลที่ Export จาก TM |
| @tensorflow/tfjs | 1.3.1 | ตรงตาม peer dependency ของ TM image 0.8.5 |
| vite | 8.3.4 | Dev server และ production build |
| @vitejs/plugin-react | 5.2.0 | React JSX รองรับ Vite 8 |
| tailwindcss / @tailwindcss/vite | 4.3.3 | CSS และ official Vite plugin |
| @playwright/test | 1.64.1 | ตรวจ UI ด้วย Edge; ไม่รวมใน production bundle |

ตรวจ metadata แพ็กเกจจาก npm registry ก่อนติดตั้ง ไม่ใช้ `--force` หรือ `--legacy-peer-deps` ไฟล์ lock บันทึกเวอร์ชันที่ใช้งานจริง

TensorFlow.js 1.3.1 เป็น runtime เก่าที่ TM helper ระบุไว้ จึงต้องตรวจโมเดลจริงและอุปกรณ์เป้าหมายก่อนยืนยันการใช้งาน หากต้องย้ายไป TF.js รุ่นใหม่ให้ตรวจ preprocessing และ model compatibility ใน AI service โดยไม่เปลี่ยน UI

ตั้ง `overrides.node-fetch = 2.7.0` เพื่อแก้ช่องโหว่ของ dependency ทางอ้อมที่ TF.js เก่าดึงมา โดยคง API ของ node-fetch major 2 ผล audit หลังติดตั้ง override รายงาน 0 vulnerabilities ณ วันที่ตรวจ ทั้งนี้ไม่ได้แทนการตรวจโมเดลจริง

## ฟังก์ชันที่เขียนแล้ว

- Upload / Drag & Drop แบบภาพเดียว รองรับ JPEG, PNG, WebP ไม่เกิน 10 MiB (10 × 1024 × 1024 bytes)
- Preview หลัง decode สำเร็จ พร้อมเปลี่ยนภาพ ลบภาพ ตรวจชนิด/ขนาด/ไฟล์ว่าง/ไฟล์เสีย และคืน object URL
- ป้องกัน browser เปิดไฟล์แทนเว็บไซต์เมื่อ drop นอกพื้นที่
- Model Not Configured, Loading Model, Model Ready, Analyzing Image, Analysis Completed, Model Error และ Prediction Error
- โมเดลโหลดครั้งเดียวต่อ URL และ cache promise ให้ Strict Mode ใช้ร่วมกัน ไม่โหลดใหม่จาก React re-render
- ตรวจชื่อ 14 คลาส ขาด/เกิน/ซ้ำ และตรวจจำนวน model outputs; ไม่ map ตาม array index
- ส่งภาพจริงเข้า `model.predict(imageElement)` แสดง probability เดิมโดยแปลงเป็นเปอร์เซ็นต์ ไม่สุ่มและไม่เปลี่ยนคะแนนให้ดูสูงขึ้น
- ป้องกันการกดวิเคราะห์ซ้อน และละทิ้งผลที่หมดอายุหลัง reset หรือออกจากหน้า
- แสดงผลจำแนกเมื่อความมั่นใจมากกว่า 70% เท่านั้น คะแนนไม่เกิน 70% แสดงข้อผิดพลาดและคำแนะนำให้ตรวจแสง/ความชัดของภาพ โดยไม่แสดงชื่อหรืออันดับ
- หน้ากำลังประมวลผลพร้อมภาพที่เลือกและแอนิเมชันสแกน ปิดอัตโนมัติเมื่อสำเร็จหรือเกิดข้อผิดพลาด รองรับ reduced motion
- Demo แยกจาก inference และติดป้าย Demo / Sample Data ทุกครั้ง ไม่มี fake processing delay
- เครื่องมือคำนวณแถบสีตัวต้านทาน 4/5 แถบอยู่ในกล่องผลลัพธ์ก่อนวิธีต่อ แสดงเมื่อผลเป็น Resistor ทั้ง AI และ Demo ซ่อนเมื่อยังไม่มีผล เปลี่ยนรูป ลบรูป หรือวิเคราะห์ไม่ผ่าน
- ผลลัพธ์ใช้ชื่อไทยเป็นหลัก แยกคำอธิบายเป็นหัวข้อ และพับรายละเอียดคะแนน AI ไว้
- วิธีต่อครบ 14 หมวดแสดงสายทีละเส้น พร้อมชื่ออุปกรณ์และขาที่ต้องต่อทั้งสองฝั่ง ใช้สีแยกไฟบวก / กราวด์ / สัญญาณ มีรายการอุปกรณ์และผลที่ควรได้ และเลือกชนิดตัวรับ/ตัวส่งหรือขาร่วมจอได้
- Library ครบ 14 ประเภท ค้นหาไทย/อังกฤษ เลือกรายละเอียดและเปิดจากผล prediction ได้
- Equipment Guide 4 ชนิด พร้อมขั้นตอน 6–7 ข้อ ข้อควรระวังและแหล่งอ่านเพิ่มเติม
- Responsive, active navigation, skip link, keyboard focus และ reduced-motion support
- Light / Dark Mode ทุกหน้า พร้อมปุ่มสลับที่แถบนำทางและจำค่าหลังรีเฟรช

โหมดเริ่มต้นเป็น Light กดปุ่มพระจันทร์/ดวงอาทิตย์ด้านขวาบนเพื่อสลับ เว็บไซต์บันทึกค่าใน `localStorage` และซิงก์การเปลี่ยนโหมดระหว่างแท็บ รวมถึงหน้าเครดิตภาพ โหลดโหมดที่บันทึกไว้ก่อนแสดงหน้าเพื่อหลีกเลี่ยงการกะพริบ หากเบราว์เซอร์ปิดการเก็บข้อมูลยังสลับโหมดในหน้าได้ ภาพอุปกรณ์และสีแถบตัวต้านทานคงสีจริงไว้ในทั้งสองโหมด

## เปิดใช้งานใน Windows PowerShell

ต้องมี Node.js `^20.19.0` หรือ `>=22.12.0` เครื่องที่พัฒนาใช้ `24.16.0` และ npm `11.13.0`

```powershell
cd circuit-ai-v3-main
npm.cmd ci
npm.cmd run dev
```

เปิด URL ที่ Vite แสดง เช่น `http://127.0.0.1:5173/` ใช้ `npm.cmd` เพื่อไม่ต้องเปลี่ยน execution policy ของ PowerShell หากติดตั้ง dependencies อยู่แล้วไม่จำเป็นต้องรัน `ci` ซ้ำ

```powershell
npm.cmd run build
npm.cmd run preview
```

Build อยู่ใน `dist/` เมื่อนำขึ้น static hosting ต้องตั้ง SPA fallback ให้ route ที่ไม่มีไฟล์ย้อนกลับ `index.html` เพื่อเปิด `/components` และ `/equipment` โดยตรงได้ ไม่มีการ deploy ในงานนี้

## เชื่อมโมเดลจริง

โปรเจกต์ใช้โมเดล `https://teachablemachine.withgoogle.com/models/mZNDylZHP/` เป็นค่าเริ่มต้นในโค้ด เมื่อ clone ไปเครื่องใหม่ ให้รัน `npm.cmd ci` และ `npm.cmd run dev` ได้เลยโดยไม่ต้องสร้าง `.env.local` (ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อดาวน์โหลดโมเดล)

หากต้องการเปลี่ยนโมเดล ให้คัดลอก `.env.example` เป็น `.env.local` แล้วตั้ง `VITE_TM_MODEL_URL` หรือใช้ `/models/my-model/` เมื่อวางไฟล์โมเดลใน `public/models/my-model/` ตั้งค่าเป็นค่าว่างเพื่อปิดการโหลดโมเดล ไฟล์ `.env.local` ไม่ถูกเก็บใน Git

โฟลเดอร์นั้นต้องมี `model.json`, `metadata.json` และ weights ทุกไฟล์ที่ `model.json` อ้างถึง ตรวจ CORS ถ้าเก็บโมเดลคนละ origin กับเว็บไซต์

ค่าตั้งต้น `VITE_AI_CONFIDENCE_THRESHOLD=0.7` ต้องเป็นตัวเลข 0 ถึง 1

Restart Vite หลังเปลี่ยน environment และ build ใหม่เมื่อเปลี่ยนค่าที่ใช้ production ค่า `VITE_*` มองเห็นใน browser ห้ามใส่ secret

อ่าน [คู่มือ Dataset, ฝึกโมเดล, Export และประเมิน Accuracy/Confusion Matrix](docs/model-guide.md) ฉบับภาษาไทย

### Mapping ของโมเดลที่ผู้ใช้อนุมัติ

จับคู่ด้วยชื่อที่ระบุใน `src/config/aiConfig.js` เท่านั้น รองรับทั้งชื่อ canonical เดิมและ aliases ต่อไปนี้ ไม่ทำ fuzzy matching และยังปฏิเสธชื่อไม่รู้จัก ชื่อขาด หรือ aliases ที่ชนกันในหมวดเดียว

| ชื่อในโมเดล | ชื่อหมวดบนเว็บ |
|---|---|
| resistor | Resistor |
| c_ceramic | C Ceramic |
| c_film | C Film |
| c_electrolytic / c_electrolyte / c_electrolyt... | C Electrolytic |
| diode | Diode |
| transistor | Transistor |
| led | LED |
| button_switch / switch / button_switc... | Switch |
| ldr | Photoresistor |
| 7segment | 7-Segment |
| potentiometer / potentiomete... | Potentiometer |
| buzzer | Buzzer |
| thermistor | Thermistor |
| phototransistor / phototransis... | IR LED / Photo transistor (โมเดลฝึกเฉพาะ Photo transistor) |

เก็บชื่อคลาสต้นฉบับไว้กับผลลัพธ์ และคง probability จริงทุกค่า การ mapping ไม่เพิ่มความสามารถจำแนก IR LED ให้โมเดล

## เพิ่มภาพอุปกรณ์จริง

ใส่ภาพจริงแล้วครบ 14 หมวดชิ้นส่วนและ 4 เครื่องมือ พร้อมภาพ IR LED เพิ่มในหมวดร่วม รวม 19 ภาพ (ประมาณ 2.3 MB) เก็บใน `public/images/components/` และ `public/images/equipment/` เบราว์เซอร์โหลดจากโครงการ ไม่เรียกภาพภายนอกตอนใช้งาน

แหล่งภาพ ผู้สร้าง สัญญาอนุญาต และ URL ดาวน์โหลดอยู่ใน `src/data/imageCredits.js` ใช้ภาพ Public domain, CC0 และ CC BY/CC BY-SA ที่อนุญาตให้ใช้ซ้ำ พร้อมเครดิตในหน้ารายละเอียดและหน้า `/images/credits.html` ที่เปิดจาก footer รูปไม่ถูกเติมเครื่องหมายขาหรือแก้เนื้อหา Thumbnail บางรายการย่อโดย Wikimedia

หากเปลี่ยนภาพ ให้อัปเดต manifest กับไฟล์ในเครื่องและเครดิตไปพร้อมกัน ห้ามใช้ภาพที่สิทธิ์ไม่ชัดเจน ตัว downloader `node scripts/fetch-component-images.mjs` ดาวน์โหลดเฉพาะไฟล์ที่ยังไม่มีและสร้างหน้าเครดิต สามารถใช้ `--discover` ค้นภาพเพิ่ม แต่ต้องตรวจชนิดอุปกรณ์และภาพจริงก่อนเลือก

## คู่มืออ่านค่าและขาอุปกรณ์

ทุกหมวดมีข้อมูล `guide` ใน `src/data/components.js`: วิธีอ่านค่า/เบอร์ วิธีดูขา/ขั้ว ตัวอย่าง ข้อควรระวัง และลิงก์เอกสารอ้างอิง เปิดจากรายละเอียดในหน้า Components Library ส่วนผล AI แสดงคำอธิบายขา/ขั้วแบบย่อพร้อมลิงก์ไปคู่มือ

Resistor มีวิธีอ่านแถบสี 4/5 แถบ รหัส SMD 3/4 หลัก และตัวอ่านสีแบบ interactive ที่แสดงค่า Ω, tolerance และช่วงค่าที่ยอมรับได้ รวมตารางสี ส่วนอุปกรณ์ที่มีขั้วอธิบาย A/K, B/C/E, G/D/S หรือขาร่วม 7-Segment ตามชนิด โดยไม่ใช้ผังขาเดียวกับทุกเบอร์

ภาพเป็นตัวอย่างรูปลักษณ์และอาจเป็นคนละรุ่นกับอุปกรณ์ของผู้ใช้ AI ไม่อ่านค่ารหัสหรือยืนยัน pinout อัตโนมัติ ต้องตรวจเครื่องหมายและ datasheet ของชิ้นงานจริง

## การตรวจสอบ

```powershell
npm.cmd test
npm.cmd run test:browser
npm.cmd run build
node tests/model-connection.mjs
```

Browser tests ใช้ Edge ที่ติดตั้งอยู่ใน Windows และเปิด test server พอร์ต 5173/5174 ชั่วคราว ต้องปิด dev server บนพอร์ตเหล่านี้ก่อนทดสอบ ในเครื่องอื่นสามารถเปลี่ยน `channel` ใน `playwright.config.js` ให้ตรงกับ browser ที่มีได้

หากพอร์ตเดิมใช้งานอยู่ สามารถใช้พอร์ตทดสอบอื่นโดยตั้ง `$env:CIRCUIT_TEST_PORT='5181'` ก่อน `npm.cmd run test:browser` ชุดทดสอบจะใช้พอร์ตที่ตั้งและพอร์ตถัดไปโดยไม่ปิด dev server ที่กำลังใช้งาน

Tests สำหรับ probability, labels, error และ low-confidence ใช้ fixture ระบุชัดในไฟล์ทดสอบ ไม่ใช่ข้อมูลที่ใช้แทน AI จริงในเว็บไซต์ ชุดทดสอบโมเดล HTTP 404 ตรวจเส้นทางการโหลดและ error handling ไม่ใช่การทดสอบความแม่นยำ

ผลตรวจวันที่ 14 ตุลาคม 2026:

| การตรวจที่รันจริง | ผล |
|---|---|
| `npm.cmd test` | ผ่าน 19/19 รวมชื่อย่อจากโมเดลจริง เกณฑ์ความมั่นใจ การเชื่อมต่อ breadboard ครบ 16 ตัวอย่าง และขอบเขตภาพที่ขยายเฉพาะสาย |
| `npm.cmd run test:browser` | รอบตรวจ UI ผ่าน 50/50 บน Edge คอมและ mobile viewport จำลอง รวมการเปลี่ยนสายในภาพขยาย การย่อ/ขยาย และ scroll lock จากนั้นทดสอบชุด AI ซ้ำผ่าน 14/14 หลังแก้ชื่อคลาสย่อและการแสดงคะแนนใกล้ 70% |
| `npm.cmd run build` | ผ่าน ได้ production assets ใน `dist/` |
| Audit หลังติดตั้ง dependency override | 0 vulnerabilities |
| `node tests/model-connection.mjs` | โมเดลจริงโหลดสำเร็จ; outputs/probabilities 14 คลาส; Analyze ในเว็บซ้ำ 2 ครั้ง; UI score ตรงกับ model output; โหลด model.json ครั้งเดียวใน Strict Mode และ reuse หลัง navigation; POST ภาพ 0 ครั้ง |

Browser tests ครอบคลุมทั้ง 3 route และ Not Found, navigation, ค้นหาไทย/อังกฤษ, รายละเอียดชิ้นส่วน, คู่มือเครื่องมือครบ 4 ชนิด, upload/preview/replace/remove, object URL cleanup, drag-and-drop, ไฟล์ผิดชนิด/ใหญ่/ว่าง/เสีย, Demo reset, ไม่มี POST ส่งภาพ, layout ที่ 320/390/768/1440 px, keyboard skip link, HTTP 404 ของโมเดล, retry และการโหลดครั้งเดียวภายใต้ Strict Mode

Loading, prediction error และการปฏิเสธคะแนนต่ำตรวจด้วย component fixture และ flow ที่จำลองเฉพาะ model loader โดยใช้ hook / การตรวจภาพ / เกณฑ์ความมั่นใจจริง Probability sorting และ class mapping ตรวจด้วย unit fixtures ส่วน tests/model-connection.mjs ตรวจโมเดลที่โหลดจริง ไม่ใช่การวัดความแม่นยำ เก็บ screenshots ทั้ง 3 หน้าและ Demo ใน `test-results/` และตรวจภาพ desktop/mobile ด้วยตาแล้ว

Build มีคำเตือนขนาด TF.js chunk ประมาณ 894 kB ก่อน gzip (ประมาณ 213 kB gzip) เป็น dynamic import ที่โหลดเมื่อมีการกำหนดโมเดล ไม่ใช่ build error

Real-model smoke test ใช้ภาพสังเคราะห์สีเทาและ PNG 1×1 เพื่อทดสอบ runtime กับ flow อัปโหลด → Analyze → ผลจริงเท่านั้น ไม่ใช่ภาพชิ้นส่วนและไม่ใช้วัด Accuracy สามารถรันซ้ำด้วยคำสั่งข้างต้นผ่าน Edge โดยใช้ Model URL จาก `.env.local` และพอร์ต 5180

**ยังตรวจไม่ได้:** ความถูกต้องของ inference สำหรับชิ้นส่วนจริง, Accuracy/Confusion Matrix และคุณภาพแต่ละคลาส เพราะยังไม่มีชุดภาพทดสอบที่มีคำตอบจริง การตรวจ mobile เป็น browser emulation ไม่ใช่โทรศัพท์จริง

## ข้อจำกัดและสิ่งที่ยังรอ

- เชื่อมโมเดลและ flow วิเคราะห์จริงแล้ว การรับรองคุณภาพยังรอภาพชิ้นส่วนจริงที่มีคำตอบและผล Accuracy/Confusion Matrix
- AI classification ไม่ตรวจจับวัตถุ ไม่ตรวจจำนวนชิ้นส่วน และไม่ยืนยันว่าภาพอยู่ในคลาสที่รู้จัก คะแนนสูงอาจผิดได้
- หมวดการเรียนรู้ IR LED / Photo transistor ยังคงรวมสองชนิด แต่โมเดลปัจจุบันฝึกเฉพาะ Photo transistor จึงยังไม่รองรับ IR LED
- ใส่ภาพอุปกรณ์จริงแล้ว โดย buzzer เป็นภาพขนาดเล็กจากต้นทาง ส่วนพิกัด/เบอร์/ลำดับขาต้องตรวจ datasheet ของอุปกรณ์จริง
- TF.js bundle มีขนาดใหญ่ แต่โหลดแบบ dynamic เฉพาะเมื่อกำหนดโมเดล หน้าเว็บที่ยังไม่มีโมเดลไม่ต้องดาวน์โหลด runtime นี้
- ไม่ได้ทดสอบบนโทรศัพท์จริงหรือ browser ทุกตระกูล และยังไม่มีการ publish เว็บไซต์


## ฟังก์ชันที่รวมจาก CircuitLib

นำแอนิเมชันสแกนรูป แถบโหลด เปอร์เซ็นต์ดาวน์โหลดโมเดล ภาพ breadboard และบททดลองพื้นฐานจาก [Electronic-Components-Librarys](https://github.com/keenzachanathip-bit/Electronic-Components-Librarys) มาปรับให้เข้ากับ Light/Dark Mode และระบบโมเดลเดิม

ภาพ breadboard ครบทั้ง 14 หมวด รวม 16 แบบการต่อเมื่อรวม IR ตัวรับ/ตัวส่งและจอขาร่วมบวก/ลบ กดขยายหรือเลือกสายทีละเส้นบน breadboard ได้ พร้อมระบุหมายเลขรูต้นทาง–ปลายทาง จอ 7-segment แสดงสาย a/COM จากจอและให้เทียบผังขาจริง ดูแหล่งที่มาและรายละเอียดการรวมใน [docs/integrations.md](docs/integrations.md)
หน้ารายละเอียดใน Components เปิดเป็นป๊อปอัปแบบ CircuitLib มีหัวข้อและปุ่มปิดค้างด้านบน แบ่งเป็นการ์ดหมายเลข: วิธีสังเกต, ขั้วและ GND, วิธีต่อ, ตัวอย่างการใช้งาน พร้อมเมนูลัดไปอ่านค่า คำนวณตัวต้านทาน ภาพวงจร และเอกสารอ้างอิง รองรับลิงก์ตรง ปิดด้วย Escape และคืนโฟกัสไปการ์ดเดิม

การต่อวงจรแสดงภาพเป็นหลัก: เลือกภาพ breadboard หรือภาพจุดต่อสาย กดหมายเลขเพื่อเน้นสายทีละเส้น และขยายภาพได้ รายการสายแบบข้อความพับเก็บไว้ใต้ภาพ

breadboard เริ่มที่สายแรกโดยแสดงเพียงเส้นเดียว พร้อมป้ายสีเขียว “จาก” และสีส้ม “ไป” ระบุรูเสียบ กดสายถัดไปเพื่อทำตามลำดับ หรือดูทุกสายเพื่อดูภาพรวม สายไฟเข้ารางใกล้ขาอุปกรณ์ สายข้ามร่องกลางผ่านช่องว่างระหว่างอุปกรณ์ และแยกทางเดินเพื่อไม่กองซ้อนที่ขอบบอร์ด

ภาพแต่ละสายขยายเฉพาะบริเวณที่ใช้ต่อโดยอัตโนมัติ มีปุ่มแสดงทั้งบอร์ด ภาพขยายเริ่มพอดีหน้าจอและมีปุ่มเลือกสาย ย่อ/ขยาย และดูทุกสายภายในหน้าต่างเดียว ดูปัญหาที่พบและผลตรวจใน [docs/ui-review.md](docs/ui-review.md)
