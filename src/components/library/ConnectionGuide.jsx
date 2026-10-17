import { useId, useState } from "react";
import { Cable, CheckCircle2, Info, ChevronLeft, ChevronRight } from "lucide-react";
import BreadboardExample from "./BreadboardExample.jsx";
import CircuitPicture from "./CircuitPicture.jsx";
import BreadboardPicture from "./BreadboardPicture.jsx";
import { buildBreadboardLayout } from "../../services/breadboardLayout.js";
import { connections } from "../../data/connections.js";

function Terminal({ label, terminal, hole, endpoint }) {
  return (
    <div className="wire-terminal">
      <span className={"wire-direction" + (endpoint ? " endpoint-" + endpoint : "")}>{label}</span>
      <span className="wire-part">{terminal.part}</span>
      <strong>{terminal.pin}</strong>
      {hole && <span className="wire-hole">{hole}</span>}
    </div>
  );
}

export default function ConnectionGuide({ component }) {
  const headingId = useId();
  const [selectedId, setSelectedId] = useState(null);
  const [activeWire, setActiveWire] = useState(0);
  const [pictureMode, setPictureMode] = useState("board");
  const [focusBoard, setFocusBoard] = useState(true);
  const connection = connections[component.id];
  if (!connection) return null;
  const example = connection.examples.find(({ id }) => id === selectedId) ?? connection.examples[0];
  const wireIndex = activeWire === null ? null : Math.min(activeWire, example.wires.length - 1);
  const selectedWire = wireIndex === null ? null : example.wires[wireIndex];
  const showBoard = pictureMode === "board";
  const board = buildBreadboardLayout(example);
  const boardWire = wireIndex === null ? null : board.wires[wireIndex];
  const step = { index: wireIndex, count: example.wires.length, onChange: setActiveWire,
    from: selectedWire && (showBoard ? boardWire.from.label : selectedWire.from.pin),
    to: selectedWire && (showBoard ? boardWire.to.label : selectedWire.to.pin) };

  function chooseExample(id) {
    setSelectedId(id);
    setActiveWire(0);
    setPictureMode("board");
    setFocusBoard(true);
  }

  function showWire(index) {
    setActiveWire(index);
  }

  return (
    <section className="connection-guide" aria-labelledby={headingId}>
      <h3 id={headingId}><Cable size={20} aria-hidden="true" />วิธีต่อใช้งาน</h3>
      <p className="connection-title">{connection.title}</p>
      {connection.examples.length > 1 && (
        <div className="connection-options" aria-label="เลือกชนิดอุปกรณ์">
          {connection.examples.map((option) => (
            <button type="button" key={option.id} aria-pressed={option.id === example.id} onClick={() => chooseExample(option.id)}>
              {option.label}
            </button>
          ))}
        </div>
      )}
      <div className="picture-modes" aria-label="เลือกภาพการต่อ">
        <button type="button" aria-pressed={showBoard} onClick={() => setPictureMode("board")}>
          ภาพ breadboard
        </button>
        <button type="button" aria-pressed={!showBoard} onClick={() => setPictureMode("circuit")}>ภาพจุดต่อสาย</button>
      </div>
      <p className="wiring-instruction">{wireIndex === null
        ? "ภาพรวมทุกสาย · เลือกหมายเลขเพื่อดูจุดเริ่มและจุดปลายของสายทีละเส้น"
        : showBoard
        ? "ต่อทีละเส้น: เริ่มที่ป้ายสีเขียว “จาก” แล้วเสียบปลายอีกด้านที่ป้ายสีส้ม “ไป”"
        : "ดูชื่อขาต้นทางและปลายทางด้านบน แล้วต่อสายตามหมายเลขที่เลือกในภาพ"}</p>
      <div className="picture-step-controls" aria-label="เลือกสายที่ต้องการดู">
        <button type="button" aria-pressed={wireIndex === null} onClick={() => setActiveWire(null)}>ดูทุกสาย</button>
        {example.wires.map((wire, index) => (
          <button type="button" key={index} aria-label={"ดูสายที่ " + (index + 1)} aria-pressed={wireIndex === index} onClick={() => showWire(index)}>
            {index + 1}
          </button>
        ))}
      </div>
      {selectedWire && (
        <div className="selected-wire-step" role="status" aria-live="polite">
          <div className="selected-wire-heading">
            <strong>สายที่ {wireIndex + 1} / {example.wires.length}</strong>
            <span>{({ power: "ต่อไฟบวก", ground: "ต่อกราวด์", signal: "ต่อสัญญาณ" })[selectedWire.type]}</span>
          </div>
          <div className={"wire-route wire-" + selectedWire.type}>
            <Terminal label="จาก · จุดเริ่ม" terminal={selectedWire.from} hole={showBoard ? boardWire.from.label : null} endpoint="from" />
            <span className="wire-route-arrow" aria-hidden="true">→</span>
            <Terminal label="ไป · จุดปลาย" terminal={selectedWire.to} hole={showBoard ? boardWire.to.label : null} endpoint="to" />
          </div>
        </div>
      )}
      {showBoard ? (
        <BreadboardExample
          diagram={<BreadboardPicture example={example} activeWire={wireIndex} focusWire={focusBoard} />}
          isBreadboard
          step={step}
          focused={focusBoard}
          onToggleFocus={() => setFocusBoard(value => !value)}
          caption={wireIndex === null ? "ภาพรวมทุกสายบน breadboard" : "เสียบสายตามป้าย จาก → ไป ในภาพ"}
          note={component.id === "seven-segment"
            ? "ต่อสายจากขา a และ COM ของจอมายัง breadboard เพื่อทดลองเปิดขีด a ตรวจผังขาและต่อ COM ทุกขาตาม datasheet ของจอจริง"
            : "ดูชื่อขาและหมายเลขรูใต้ภาพ ขาอุปกรณ์แต่ละขาอยู่คนละกลุ่มรู ตำแหน่งขาเป็นตัวอย่างการจัดวาง ให้ปรับตามขาและระยะจริงของอุปกรณ์"}
        />
      ) : (
        <BreadboardExample
          diagram={<CircuitPicture example={example} activeWire={wireIndex} />}
          step={step}
          caption="ภาพอุปกรณ์และจุดต่อสาย"
          note="ชื่อขาในภาพใช้เทียบกับผังขาของรุ่นจริง เส้นสีแสดงสายที่ต้องเชื่อมถึงกัน"
        />
      )}
      {selectedWire && <div className="wire-step-navigation">
        <button type="button" aria-label="สายก่อนหน้า" disabled={wireIndex === 0} onClick={() => showWire(wireIndex - 1)}><ChevronLeft size={18} /> ก่อนหน้า</button>
        <span>{wireIndex + 1} / {example.wires.length}</span>
        <button type="button" aria-label="สายถัดไป" disabled={wireIndex === example.wires.length - 1} onClick={() => showWire(wireIndex + 1)}>สายถัดไป <ChevronRight size={18} /></button>
      </div>}
      <div className="wire-legend" aria-label="สีแนะนำสำหรับสายไฟ">
        <span><i className="wire-dot wire-power" aria-hidden="true" />ไฟบวก</span>
        <span><i className="wire-dot wire-ground" aria-hidden="true" />กราวด์</span>
        <span><i className="wire-dot wire-signal" aria-hidden="true" />สัญญาณ</span>
      </div>
      <p className="wiring-setup"><Info size={17} aria-hidden="true" /><span>ปิดไฟก่อนต่อสาย · {example.setup}</span></p>
      <div className="wiring-outcome">
        <CheckCircle2 size={20} aria-hidden="true" />
        <div><p>ต่อครบแล้วจะได้อะไร?</p><strong>{example.outcome}</strong></div>
      </div>
      <details className="connection-details wiring-parts">
        <summary>อุปกรณ์ที่ต้องเตรียม</summary>
        <ul>{example.parts.map((part) => <li key={part}>{part}</li>)}</ul>
      </details>
      <details className="connection-details connection-wire-details">
        <summary>ดูจุดต่อสายทั้งหมดแบบข้อความ</summary>
        <ol className="wire-list" aria-label={"จุดต่อสาย: " + example.label}>
          {example.wires.map((wire, index) => (
            <li className={"wire-row wire-" + wire.type} key={example.id + "-" + index}>
              <span className="wire-number" aria-label={"สายที่ " + (index + 1)}>{index + 1}</span>
              <Terminal label="ต่อจาก" terminal={wire.from} />
              <span aria-hidden="true">→</span>
              <Terminal label="ไปที่" terminal={wire.to} />
            </li>
          ))}
        </ol>
      </details>
      {example.checks?.length > 0 && (
        <details className="connection-details wiring-checks">
          <summary>ถ้าต่อแล้วไม่ทำงาน ให้ตรวจอะไร?</summary>
          <ul>{example.checks.map((check) => <li key={check}>{check}</li>)}</ul>
        </details>
      )}
      <details className="connection-details">
        <summary>ข้อควรรู้และรายละเอียดเพิ่มเติม</summary>
        <p>{connection.note}</p>
        {connection.sources?.map((source) => (
          <a className="text-link mt-3 mr-4" key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
        ))}
      </details>
    </section>
  );
}
