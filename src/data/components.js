import { imageCredits } from "./imageCredits.js";

// IDs are stable data keys; classificationLabel must match model metadata exactly.
export const components = [
  {
    id: "resistor",
    classificationLabel: "Resistor",
    name: "Resistor",
    thaiName: "ตัวต้านทาน",
    type: "Passive",
    icon: "resistor",
    guide: {
      polarity:
        "ไม่มีขั้ว + / − ต่อสลับด้านได้ แต่ต้องเลือกค่า Ω และกำลังวัตต์ให้เหมาะกับวงจร",
      pins: [
        "ตัวต้านทานทั่วไปมี 2 ขา ทั้งสองด้านทำหน้าที่เหมือนกัน",
        "อ่านแถบสีจากด้านที่แถบแรกอยู่ใกล้ปลายตัวถัง แถบค่าคลาดเคลื่อนมักแยกห่างจากกลุ่มอื่น หากทิศทางไม่ชัดให้ตรวจด้วยมัลติมิเตอร์",
      ],
      reading: [
        "4 แถบ: ตัวเลข 2 หลัก × ตัวคูณ แล้วอ่านค่าคลาดเคลื่อนจากแถบสุดท้าย",
        "5 แถบ: ตัวเลข 3 หลัก × ตัวคูณ แล้วอ่านค่าคลาดเคลื่อนจากแถบสุดท้าย แถบที่ 6 ของบางรุ่นใช้บอกสัมประสิทธิ์อุณหภูมิ",
        "SMD แบบรหัส 3 หลัก: สองตัวแรกเป็นเลขนัยสำคัญ ตัวท้ายเป็นเลขชี้กำลังของ 10 เช่น 103 = 10 × 10³ = 10 kΩ; แบบ 4 หลัก 1001 = 100 × 10¹ = 1 kΩ",
        "R แทนจุดทศนิยม เช่น 4R7 = 4.7 Ω และ 0 หรือ 000 มักเป็น Zero-ohm jumper รหัส EIA-96 เช่น 01C ต้องเปิดตารางเฉพาะ ไม่อ่านด้วยสูตร 3 หลัก",
      ],
      example:
        "เหลือง–ม่วง–แดง–ทอง → 47 × 100 = 4,700 Ω หรือ 4.7 kΩ ±5% ช่วงค่าคือ 4,465–4,935 Ω",
      caution:
        "ปิดไฟก่อนวัดความต้านทาน การวัดในวงจรอาจอ่านค่าจากทางขนาน ควรยกขาหนึ่งด้านหรือถอดออกเมื่อต้องการวัดค่าอุปกรณ์",
      sources: [
        {
          title: "DigiKey: Resistor color code",
          url: "https://www.digikey.com/en/resources/conversion-calculators/conversion-calculator-resistor-color-code",
        },
        {
          title: "Vishay: SMD resistor marking",
          url: "https://www.vishay.com/docs/20020/smdmark.pdf",
        },
      ],
    },
    description:
      "อุปกรณ์ที่จำกัดกระแสและสร้างแรงดันตกคร่อม มีค่าความต้านทานเป็นโอห์ม (Ω)",
    function: "จำกัดกระแส แบ่งแรงดัน และกำหนดจุดทำงานของวงจร",
    principle:
      "ความสัมพันธ์พื้นฐานคือ V = IR ส่วนพลังงานที่สูญเสียจะเปลี่ยนเป็นความร้อน ต้องเลือกกำลังวัตต์ให้เพียงพอ",
    identification:
      "แบบแกนมักมีแถบสีบอกค่า แบบ SMD อาจพิมพ์รหัสตัวเลขหรือไม่มีรหัส ตรวจค่าด้วยมัลติมิเตอร์เมื่อถอดออกจากวงจร",
    applications: [
      "จำกัดกระแส LED",
      "วงจรแบ่งแรงดัน",
      "ตัวต้านทาน Pull-up / Pull-down",
    ],
  },
  {
    id: "ceramic-capacitor",
    classificationLabel: "C Ceramic",
    name: "C Ceramic",
    thaiName: "ตัวเก็บประจุเซรามิก",
    type: "Passive",
    icon: "capacitor",
    guide: {
      polarity: "ตัวเก็บประจุเซรามิกทั่วไปไม่มีขั้ว + / − ต่อสลับด้านได้",
      pins: [
        "แบบขาเสียบมี 2 ขา ไม่ต้องแยกบวกและลบ",
        "รหัสบนตัวถังใช้บอกค่า ไม่ใช่เครื่องหมายขั้ว รุ่น SMD ขนาดเล็กอาจไม่มีรหัสเลย",
      ],
      reading: [
        "รหัสความจุ 3 หลักที่ใช้กันทั่วไปอ่านในหน่วย pF: สองตัวแรก × 10 ยกกำลังตัวที่สาม",
        "104 = 100,000 pF = 100 nF = 0.1 µF; 103 = 10 nF; 102 = 1 nF; 473 = 47 nF เช่นตัวเลขบนภาพตัวอย่าง",
        "ตัวอักษรค่าคลาดเคลื่อนที่พบบ่อย J = ±5%, K = ±10%, M = ±20% แต่รหัสวัสดุหรือพิกัดแรงดันต้องอ้างอิงผู้ผลิต",
      ],
      example:
        "104K คือ 100 nF ±10% ตามระบบรหัสนี้ ตัวเลข 104 ไม่ได้บอกแรงดันใช้งานสูงสุด",
      caution:
        "เลือกแรงดันพิกัดให้เหมาะสม หากตัวถังไม่มีรหัสต้องดูข้อมูลรุ่นหรือวัดด้วยเครื่องวัด capacitance ไม่เดาจากสี",
      sources: [
        {
          title: "Murata: Ceramic capacitor part numbers",
          url: "https://www.murata.com/en-us/support/faqs/capacitor/ceramiccapacitor/part/0001",
        },
      ],
    },
    description:
      "ตัวเก็บประจุที่ใช้เซรามิกเป็นไดอิเล็กทริก โดยทั่วไปไม่มีขั้ว หน่วยความจุคือฟารัด (F)",
    function:
      "กรองสัญญาณรบกวนและเก็บประจุชั่วคราว มักใช้เป็นตัวเก็บประจุบายพาสใกล้ IC",
    principle:
      "เก็บพลังงานในสนามไฟฟ้าระหว่างแผ่นตัวนำ อิมพีแดนซ์ของตัวเก็บประจุอุดมคติลดลงเมื่อความถี่เพิ่มขึ้น",
    identification:
      "มีทั้งแผ่นกลมแบบขาเสียบและชิ้นสี่เหลี่ยม SMD รหัส 104 หมายถึง 100,000 pF หรือ 100 nF รูปลักษณ์อย่างเดียวระบุค่าหรือพิกัดไม่ได้",
    applications: [
      "Decoupling แหล่งจ่ายไฟ",
      "ตัวกรองความถี่สูง",
      "วงจรตั้งเวลา",
    ],
  },
  {
    id: "film-capacitor",
    classificationLabel: "C Film",
    name: "C Film",
    thaiName: "ตัวเก็บประจุฟิล์ม",
    type: "Passive",
    icon: "capacitor",
    guide: {
      polarity:
        "ตัวเก็บประจุฟิล์มทั่วไปไม่มีขั้ว + / − แต่บางรุ่นอาจทำเครื่องหมายด้านฟอยล์นอก ซึ่งไม่ใช่ขั้วลบแบบ Electrolytic",
      pins: [
        "โดยทั่วไปมี 2 ขา ต่อสลับด้านได้ในงานทั่วไป",
        "งานต่อกับไฟบ้านต้องใช้ตัวเก็บประจุชนิด Safety X/Y ที่ตรงการใช้งาน ไม่ใช้ฟิล์มทั่วไปแทน",
      ],
      reading: [
        "อ่านค่าที่พิมพ์เป็น nF หรือ µF โดยตรง เช่น 100n = 100 nF, 0.1µF = 100 nF",
        "ถ้าใช้รหัส 3 หลัก เช่น 104 ให้แปลงจาก 10 × 10⁴ pF = 100 nF",
        "อ่านแรงดัน V และตัวอักษร tolerance แยกจากค่าความจุ เช่น J = ±5% ตามระบบที่ผู้ผลิตใช้",
      ],
      example:
        "104J 100V หมายถึง 100 nF ±5% พิกัดแรงดันตามเครื่องหมาย 100 V ต้องตรวจว่าเป็นพิกัด DC หรือ AC จาก datasheet",
      caution:
        "คายประจุอย่างเหมาะสมก่อนจับหรือวัด ตัวถังคล้ายกันอาจมีชนิดไดอิเล็กทริกและพิกัดต่างกัน",
      sources: [
        {
          title: "Vishay: Film capacitors",
          url: "https://www.vishay.com/en/capacitors/film/",
        },
      ],
    },
    description:
      "ใช้ฟิล์มพลาสติกเป็นไดอิเล็กทริก มักไม่มีขั้วและมีความเสถียรเหมาะกับงานสัญญาณ",
    function: "คัปปลิงสัญญาณ กรองความถี่ และเก็บพลังงานตามพิกัดของแต่ละรุ่น",
    principle:
      "เก็บประจุระหว่างขั้วตัวนำที่คั่นด้วยฟิล์ม คุณสมบัติการสูญเสียและความทนทานขึ้นกับวัสดุและโครงสร้าง",
    identification:
      "มักเป็นทรงกล่องหรือทรงกระบอก มีค่าความจุและพิกัดแรงดันพิมพ์บนตัวถัง ต้องอ่านเครื่องหมายและ datasheet",
    applications: [
      "วงจรกรองเสียง",
      "คัปปลิงสัญญาณ",
      "Snubber เมื่อใช้รุ่นที่รองรับ",
    ],
  },
  {
    id: "electrolytic-capacitor",
    classificationLabel: "C Electrolytic",
    name: "C Electrolytic",
    thaiName: "ตัวเก็บประจุอิเล็กโทรไลต์",
    type: "Passive",
    icon: "capacitor",
    guide: {
      polarity:
        "รุ่นอะลูมิเนียมมีขั้วทั่วไปต้องต่อ + / − ให้ถูกต้อง ยกเว้นรุ่น Bipolar / Non-polar ที่ระบุชัด",
      pins: [
        "แถบบนตัวถังที่มีเครื่องหมาย − ของอะลูมิเนียม Electrolytic มักชี้ขั้วลบ บางรุ่นทำเครื่องหมาย + เพื่อชี้ด้านบวก ให้ยึดสัญลักษณ์จริง ไม่ใช้สีแถบอย่างเดียว",
        "ขาที่ยาวกว่าของชิ้นใหม่มักเป็นขั้วบวก แต่ใช้ไม่ได้เมื่อขาถูกตัดหรือดัดแล้ว ให้ยึดเครื่องหมายและ datasheet",
        "อย่าใช้กฎแถบ = ลบกับตัวเก็บประจุทุกชนิด เช่น Tantalum หลายรุ่นทำเครื่องหมายขั้วบวก",
      ],
      reading: [
        "อ่านค่าความจุที่พิมพ์ เช่น 100 µF และแรงดันพิกัด เช่น 25 V",
        "อ่านอุณหภูมิและชนิดตาม datasheet ค่าความจุเท่ากันไม่ได้แปลว่า ESR และกระแส Ripple เท่ากัน",
      ],
      example:
        "100 µF 25 V คือความจุ 100 ไมโครฟารัด พิกัด 25 โวลต์ ไม่ใช่แหล่งจ่ายไฟ 25 โวลต์",
      caution:
        "การกลับขั้วหรือเกินแรงดันพิกัดอาจทำให้อุปกรณ์ร้อนและเสียหาย ปิดไฟและคายประจุก่อนตรวจ ห้ามลัดวงจรขาเพื่อคายประจุโดยตรง",
      sources: [
        {
          title: "SparkFun: Electrolytic capacitor polarity",
          url: "https://learn.sparkfun.com/tutorials/polarity/electrolytic-capacitors",
        },
      ],
    },
    description:
      "ตัวเก็บประจุที่ให้ความจุสูงเมื่อเทียบกับขนาด รุ่นอะลูมิเนียมที่พบบ่อยมักมีขั้ว",
    function: "ลดแรงดันกระเพื่อมและสำรองพลังงานช่วงสั้นในภาคจ่ายไฟ",
    principle:
      "ชั้นออกไซด์บางทำหน้าที่เป็นไดอิเล็กทริก ต้องใช้แรงดันและขั้วตามพิกัด รุ่นมีขั้วอาจเสียหายเมื่อกลับขั้ว",
    identification:
      "มักเป็นกระบอก มีค่า µF และ V แถบบนตัวถังอะลูมิเนียมมักระบุขั้วลบ แต่ควรยืนยันเครื่องหมายของรุ่นนั้น",
    applications: ["กรองไฟ DC", "ภาคจ่ายไฟ", "คัปปลิงสัญญาณความถี่ต่ำ"],
  },
  {
    id: "diode",
    classificationLabel: "Diode",
    name: "Diode",
    thaiName: "ไดโอด",
    type: "Semiconductor",
    icon: "diode",
    guide: {
      polarity:
        "มีขั้ว Anode (A) และ Cathode (K) การไบอัสตรงให้ A มีศักย์สูงกว่า K ไม่ใช่กฎว่าทุกวงจรต้องต่อ A กับไฟบวกเสมอ",
      pins: [
        "ไดโอดแกนทั่วไปมีแถบที่ตัวถังระบุ Cathode (K)",
        "เส้นในสัญลักษณ์ไดโอดอยู่ฝั่ง Cathode ใช้เทียบกับสกรีน PCB และตรวจ datasheet ของรุ่นจริง",
        "โหมด Diode test ของมัลติมิเตอร์ทั่วไป: แดงที่ A ดำที่ K จะอ่านแรงดันไบอัสตรง กลับสายมักอ่าน OL; ผลอาจต่างเมื่ออยู่ในวงจร",
      ],
      reading: [
        "รหัสเช่น 1N4148 หรือ 1N4007 เป็นเบอร์รุ่น ไม่ใช่ค่าความต้านทาน",
        "ตรวจแรงดันย้อนสูงสุด กระแส และชนิด เช่น Schottky / Zener จาก datasheet",
      ],
      example:
        "1N4148 แบบแก้วมีแถบระบุ Cathode แรงดันไบอัสตรงที่วัดได้ขึ้นกับกระแสทดสอบและอุณหภูมิ",
      caution:
        "ปิดแหล่งจ่ายและคายประจุก่อนใช้ Diode test รูปลักษณ์เหมือนกันไม่ได้แปลว่าใช้แทนกันได้",
      sources: [
        {
          title: "Vishay: 1N4148 datasheet",
          url: "https://www.vishay.com/docs/81857/1n4148.pdf",
        },
      ],
    },
    description:
      "อุปกรณ์สารกึ่งตัวนำสองขั้ว ได้แก่ Anode และ Cathode โดยไดโอดทั่วไปนำกระแสได้เด่นในทิศทางเดียว",
    function:
      "เรียงกระแส ป้องกันกลับขั้ว และป้องกันแรงดันย้อนจากโหลดเหนี่ยวนำตามชนิดของไดโอด",
    principle:
      "รอยต่อ PN นำกระแสเมื่อไบอัสตรง แรงดันตกคร่อมขึ้นกับชนิด กระแส และอุณหภูมิ ไม่ใช่ค่าคงที่เสมอ",
    identification:
      "แบบขาเสียบมักมีแถบระบุ Cathode มีตัวถังแก้วหรือพลาสติก ตรวจรหัสรุ่นเพื่อแยกไดโอดธรรมดา Zener หรือ Schottky",
    applications: ["วงจรเรียงกระแส", "Flyback diode", "ป้องกันการต่อกลับขั้ว"],
  },
  {
    id: "transistor",
    classificationLabel: "Transistor",
    name: "Transistor",
    thaiName: "ทรานซิสเตอร์",
    type: "Semiconductor",
    icon: "transistor",
    guide: {
      polarity:
        "ขาไม่ได้เรียกแค่ + / −: BJT ใช้ Base / Collector / Emitter ส่วน MOSFET ใช้ Gate / Drain / Source",
      pins: [
        "อ่านเบอร์บนตัวถังและดูรูป Pin configuration ของ datasheet รุ่นนั้น",
        "ตรวจทิศทางรูปให้ชัดว่าเป็นมุมมองด้านหน้า ด้านล่าง หรือด้านบน ก่อนเทียบขาจริง",
        "ทรง TO-92 เหมือนกันอาจเรียงขาต่างกัน ห้ามใช้กฎซ้าย–กลาง–ขวาแบบเดียวกับทุกเบอร์",
      ],
      reading: [
        "รหัสเช่น 2N3904 หรือ BC547 เป็นเบอร์รุ่น ค้น datasheet เพื่อแยก NPN / PNP และพิกัด",
        "MOSFET ต้องตรวจชนิด N/P channel, แรงดัน Gate ที่ใช้เปิด และพิกัด Gate ไม่อ่านจากจำนวนขาอย่างเดียว",
      ],
      example:
        "2N3904 เป็นตัวอย่าง NPN BJT แต่ต้องใช้ pinout ของผู้ผลิตและ package ที่ตรงกับชิ้นงานจริง",
      caution:
        "AI จำแนกหมวดอุปกรณ์ ไม่ยืนยันเบอร์หรือ pinout หลีกเลี่ยงการสัมผัสขา Gate ของ MOSFET โดยไม่มีการป้องกันไฟฟ้าสถิต",
      sources: [
        {
          title: "onsemi: 2N3904 datasheet",
          url: "https://www.onsemi.com/pdf/datasheet/2n3904-d.pdf",
        },
      ],
    },
    description:
      "อุปกรณ์ควบคุมกระแสสำหรับขยายสัญญาณหรือเป็นสวิตช์ มีหลายชนิด เช่น BJT และ MOSFET",
    function: "ขยายสัญญาณและควบคุมโหลดไฟฟ้าจากสัญญาณควบคุม",
    principle:
      "BJT ใช้กระแส Base ควบคุมกระแส Collector ส่วน MOSFET ใช้แรงดัน Gate ควบคุมช่องนำกระแส",
    identification:
      "มักมี 3 ขา แต่ลำดับขาและชนิดไม่เหมือนกันทุกเบอร์ ต้องดูรหัสและ datasheet ไม่ควรเดาจากตัวถังเพียงอย่างเดียว",
    applications: [
      "ขับรีเลย์หรือมอเตอร์",
      "วงจรขยายสัญญาณ",
      "สวิตช์ในภาคจ่ายไฟ",
    ],
  },
  {
    id: "led",
    classificationLabel: "LED",
    name: "LED",
    thaiName: "ไดโอดเปล่งแสง",
    type: "Optoelectronic",
    icon: "led",
    guide: {
      polarity: "มี Anode (A) และ Cathode (K) ต้องต่อให้ถูกทิศและจำกัดกระแส",
      pins: [
        "LED ขาเสียบใหม่ทั่วไป: ขายาวมักเป็น Anode (+), ขาสั้นมักเป็น Cathode (−)",
        "ด้านแบนที่ขอบโดมมักอยู่ฝั่ง Cathode ใช้ร่วมกับ datasheet อย่าอาศัยความยาวขาเมื่อขาถูกตัด",
        "LED แบบ SMD, RGB หรือหลายขาต้องตรวจเครื่องหมายและ pinout เฉพาะรุ่น",
      ],
      reading: [
        "LED ไม่มีรหัสค่าความต้านทาน อ่านสี รุ่น Forward voltage (Vf) และกระแสที่แนะนำจาก datasheet",
        "เลือกตัวต้านทานอนุกรมด้วย R = (แรงดันจ่าย − Vf) / กระแสที่ต้องการ หน่วยกระแสต้องเป็นแอมแปร์",
      ],
      example:
        "ตัวอย่างสมมติ: ไฟ 5 V, LED Vf ≈ 2 V และ R 330 Ω ให้กระแสประมาณ (5−2)/330 ≈ 9.1 mA ไม่ใช้ตัวเลขนี้แทนพิกัด LED ทุกชนิด",
      caution:
        "ไม่ต่อ LED เปล่าคร่อมแหล่งจ่ายโดยไม่มีวงจรจำกัดกระแส ค่า Vf และกระแสที่เหมาะสมขึ้นกับรุ่น",
      sources: [
        {
          title: "SparkFun: Diode and LED polarity",
          url: "https://learn.sparkfun.com/tutorials/polarity/diode-and-led-polarity",
        },
      ],
    },
    description:
      "ไดโอดที่เปล่งแสงเมื่อมีกระแสไหลในทิศทางไบอัสตรง มีหลายสีและหลายรูปแบบ",
    function: "แสดงสถานะ ให้แสงสว่าง และส่งสัญญาณแสง",
    principle:
      "การรวมตัวของอิเล็กตรอนและโฮลปล่อยพลังงานเป็นแสง ต้องจำกัดกระแสด้วยตัวต้านทานหรือวงจรขับที่เหมาะสม",
    identification:
      "แบบขาเสียบมักมีโดมใสหรือสี ขายาวมักเป็น Anode และด้านแบนมักเป็น Cathode แต่ต้องตรวจ datasheet โดยเฉพาะเมื่อขาถูกตัด",
    applications: ["ไฟแสดงสถานะ", "จอแสดงผล", "ระบบไฟส่องสว่าง"],
  },
  {
    id: "ir-led-photo-transistor",
    classificationLabel: "IR LED / Photo transistor",
    name: "IR LED / Photo transistor",
    thaiName: "LED อินฟราเรด / โฟโตทรานซิสเตอร์",
    type: "Optoelectronic",
    icon: "infrared",
    guide: {
      polarity:
        "IR LED ใช้ Anode / Cathode ส่วน Photo transistor ใช้ Collector / Emitter จึงใช้วิธีดูขาเหมือนกันทุกตัวไม่ได้",
      pins: [
        "IR LED แบบขาเสียบมักมีเครื่องหมายคล้าย LED แต่ต้องยืนยัน datasheet และใช้ตัวต้านทานจำกัดกระแส",
        "Photo transistor 2 ขาเป็น C และ E บางรุ่นมีขา Base เพิ่มเป็น 3 ขา ลำดับขา เครื่องหมายด้านแบน และความยาวขาขึ้นกับรุ่น",
        "อย่าเดาว่าตัวถังใสคือตัวส่ง หรือสีดำคือตัวรับ ใช้เบอร์รุ่นแยกก่อนต่อวงจร",
      ],
      reading: [
        "ตรวจ datasheet ว่าเป็นตัวส่งอินฟราเรดหรือตัวรับแสง และดูความยาวคลื่นที่รองรับ",
        "สำหรับตัวรับตรวจ VCE และการต่อโหลด ส่วนตัวส่งตรวจ Vf และกระแสขับที่ผู้ผลิตแนะนำ",
      ],
      example:
        "TEPT4400 เป็นตัวอย่าง Photo transistor รับแสงย่านมองเห็น ไม่ใช่ IR LED และไม่ใช่ตัวรับอินฟราเรดทุกย่าน",
      caution:
        "โมเดลที่เชื่อมอยู่ฝึกเฉพาะ Photo transistor ไม่รวม IR LED ภาพและเนื้อหาหมวดร่วมนี้มีไว้เรียนรู้ทั้งสองชนิด",
      sources: [
        {
          title: "Vishay: TEPT4400 pin configuration",
          url: "https://www.vishay.com/docs/81341/tept4400.pdf",
        },
        {
          title: "SparkFun: LED polarity",
          url: "https://learn.sparkfun.com/tutorials/polarity/diode-and-led-polarity",
        },
      ],
    },
    description:
      "หมวดจำแนกภาพร่วมสำหรับตัวส่งแสงอินฟราเรดและทรานซิสเตอร์รับแสง แม้ทำหน้าที่ต่างกัน",
    function:
      "IR LED ส่งแสงอินฟราเรด ส่วน Photo transistor ตรวจรับแสงและเปลี่ยนเป็นสัญญาณกระแส",
    principle:
      "ตัวส่งทำงานคล้าย LED แต่เปล่งแสงที่ตามักมองไม่เห็น ตัวรับใช้แสงสร้างและขยายกระแสในสารกึ่งตัวนำ",
    identification:
      "ตัวถังอาจคล้าย LED ใสหรือสีเข้ม รูปลักษณ์ไม่เพียงพอแยกตัวส่งกับตัวรับ ต้องตรวจเบอร์ ขั้ว และวงจรใช้งาน",
    applications: ["เซนเซอร์ตรวจวัตถุ", "วงจรนับรอบ", "ระบบสื่อสารอินฟราเรด"],
  },
  {
    id: "switch",
    classificationLabel: "Switch",
    name: "Switch",
    thaiName: "สวิตช์",
    type: "Electromechanical",
    icon: "switch",
    guide: {
      polarity:
        "หน้าสัมผัสสวิตช์ทั่วไปไม่มีขั้ว + / − แต่สวิตช์ที่มีไฟ LED หรือวงจรในตัวอาจมีขั้วเพิ่มเติม",
      pins: [
        "ปุ่มกด 4 ขามักมีขาสองคู่ที่เชื่อมกันอยู่แล้ว การกดจึงเชื่อมระหว่างคู่ ต้องตรวจรุ่นหรือวัด Continuity",
        "สวิตช์ SPDT มี Common, NO/NC หรือหน้าสัมผัสเลือกทาง ขา Common ไม่ได้แปลว่าเป็นกราวด์เสมอ",
        "ใช้มัลติมิเตอร์โหมด Continuity ตรวจคู่ขาขณะไม่กดและขณะกด โดยถอดออกจากวงจรที่มีไฟ",
      ],
      reading: [
        "อ่านพิกัดกระแสและแรงดัน AC/DC จากตัวถังหรือ datasheet",
        "จำนวนขาไม่เท่ากับจำนวนตำแหน่งการทำงานเสมอ ดูชนิด Momentary หรือ Latching",
      ],
      example:
        "ปุ่ม Momentary ต่อวงจรเฉพาะตอนกด ส่วนสวิตช์ Latching ค้างสถานะหลังปล่อย",
      caution:
        "อย่าวัด Continuity ในวงจรที่มีไฟ และอย่าใช้สวิตช์สัญญาณขนาดเล็กสับโหลดกำลังสูงเกินพิกัด",
      sources: [
        {
          title: "Omron: Basic switch terminology",
          url: "https://www.omron.com/ecb/products/sw/",
        },
      ],
    },
    description:
      "อุปกรณ์เปิด ปิด หรือเปลี่ยนเส้นทางการเชื่อมต่อไฟฟ้า มีแบบกด โยก เลื่อน และหมุน",
    function: "ควบคุมการเชื่อมต่อวงจรและรับคำสั่งจากผู้ใช้",
    principle:
      "หน้าสัมผัสเปลี่ยนสถานะเมื่อกลไกเคลื่อนที่ สวิตช์เชิงกลอาจเกิด Contact bounce จึงมักต้องทำ Debounce",
    identification:
      "มีปุ่มหรือกลไกพร้อมขาต่อ จำนวนขาไม่ใช่จำนวนวงจรเสมอ ตรวจผังหน้าสัมผัสและพิกัดกระแส",
    applications: ["ปุ่มกดควบคุม", "สวิตช์เปิดปิด", "เลือกโหมดการทำงาน"],
  },
  {
    id: "photoresistor",
    classificationLabel: "Photoresistor",
    name: "Photoresistor",
    thaiName: "ตัวต้านทานไวแสง (LDR)",
    type: "Sensor",
    icon: "light",
    guide: {
      polarity: "LDR ทั่วไปไม่มีขั้ว + / − สองขาต่อสลับด้านได้",
      pins: [
        "ชิ้นส่วน LDR เปล่ามี 2 ขา ไม่มีขาสัญญาณแยก",
        "โมดูล LDR ที่มีบอร์ดอาจมี VCC, GND, AO/DO ซึ่งเป็นคนละกรณีกับชิ้นส่วนเปล่า",
      ],
      reading: [
        "ปิดไฟและวัด Ω ขณะบังแสง จากนั้นส่องแสง เปรียบเทียบค่าที่เปลี่ยนไป",
        "ค่าความต้านทานขึ้นกับความเข้มแสง ไม่มีค่าเดียวคงที่เหมือนตัวต้านทานทั่วไป",
      ],
      example:
        "เมื่อส่องแสงมากขึ้น LDR ทั่วไปมีความต้านทานลดลง ใช้วงจรแบ่งแรงดันเพื่อให้ไมโครคอนโทรลเลอร์อ่านค่า",
      caution:
        "ค่าที่วัดไม่เท่ากับ lux โดยตรง ต้องปรับเทียบและอ้างอิงข้อมูลของรุ่นที่ใช้",
      sources: [
        {
          title: "SparkFun: Photocell tutorial",
          url: "https://learn.sparkfun.com/tutorials/photocell-hookup-guide/all",
        },
      ],
    },
    description:
      "ตัวต้านทานที่เปลี่ยนค่าตามความเข้มแสง โดยทั่วไปความต้านทานลดลงเมื่อได้รับแสงมากขึ้น",
    function: "ตรวจระดับแสงและสร้างสัญญาณสำหรับวงจรควบคุม",
    principle:
      "แสงเพิ่มพาหะนำไฟฟ้าในวัสดุ ทำให้การนำไฟฟ้าเพิ่มขึ้น มักอ่านค่าโดยต่อเป็นวงจรแบ่งแรงดัน",
    identification:
      "แบบที่พบบ่อยเป็นแผ่นกลม มีลายทางคดเคี้ยวบนผิวและสองขา โดยทั่วไปไม่มีขั้ว",
    applications: [
      "ไฟเปิดอัตโนมัติเมื่อมืด",
      "ตรวจแสงแวดล้อม",
      "วงจรทดลองเซนเซอร์",
    ],
  },
  {
    id: "seven-segment",
    classificationLabel: "7-Segment",
    name: "7-Segment",
    thaiName: "จอแสดงผลเจ็ดส่วน",
    type: "Display",
    icon: "display",
    guide: {
      polarity:
        "ต้องแยกชนิด Common anode กับ Common cathode ขาแต่ละ Segment ไม่ใช่ขาบวกหรือลบที่เดาได้จากตำแหน่ง",
      pins: [
        "อ่านเบอร์รุ่นและหา pinout ของ Segment a–g, จุด DP และขาร่วม COM",
        "Common cathode ต่อขาร่วมด้าน Cathode; Common anode ต่อขาร่วมด้าน Anode โดยทิศทางการขับ Segment ต่างกัน",
        "ไม่ใช้ผังขาของจออีกเบอร์แทน แม้ตัวถังและจำนวนขาจะเหมือนกัน",
      ],
      reading: [
        "เบอร์บนตัวถังใช้ค้น package, สี, pinout และ Forward voltage ของแต่ละ Segment",
        "ใส่ตัวต้านทานจำกัดกระแสสำหรับแต่ละ Segment หรือใช้วงจรขับที่ออกแบบรองรับ",
      ],
      example:
        "Kingbright SC56-21SEKWA เป็นตัวอย่างจอแบบ Common cathode ต้องเทียบผังขาของเบอร์นี้และทิศทางรูปใน datasheet",
      caution:
        "อย่าต่อ LED Segment ตรงกับแหล่งจ่ายโดยไม่มีตัวจำกัดกระแส การแสดงหลายหลักอาจต้องใช้วงจร Multiplex",
      sources: [
        {
          title: "Kingbright: SC56-21SEKWA datasheet",
          url: "https://www.kingbright.com/attachments/file/psearch/000/00/20131112/SC56-21SEKWA%28Ver.5A%29.pdf",
        },
      ],
    },
    description:
      "จอแสดงตัวเลขที่ประกอบด้วยส่วนเรืองแสง 7 ส่วน และมักมีจุดทศนิยมเพิ่มเติม",
    function: "แสดงตัวเลขและอักขระบางตัวด้วยการเปิดแต่ละ Segment",
    principle:
      "รุ่น LED มีแบบ Common anode และ Common cathode ต้องจำกัดกระแสแต่ละส่วน และอาจใช้ Multiplex สำหรับหลายหลัก",
    identification:
      "ตัวถังสี่เหลี่ยมมีรูปเลข 8 และหลายขา ต้องตรวจ pinout และชนิดขาร่วมจาก datasheet",
    applications: ["นาฬิกาดิจิทัล", "ตัวนับ", "แสดงค่าจากเครื่องวัด"],
  },
  {
    id: "potentiometer",
    classificationLabel: "Potentiometer",
    name: "Potentiometer",
    thaiName: "ตัวต้านทานปรับค่าได้",
    type: "Passive",
    icon: "dial",
    guide: {
      polarity:
        "ตัวต้านทานปรับค่าได้เปล่าทั่วไปไม่มีขั้ว + / − แต่มีขาปลายแถบความต้านทานสองขาและ Wiper หนึ่งขา",
      pins: [
        "รุ่น 3 ขาหลายแบบใช้ขากลางเป็น Wiper แต่ควรตรวจผังขาก่อน โดยเฉพาะ Trimmer หรือรุ่นหลายชุด",
        "วัดระหว่างขาปลายสองด้าน ค่าควรใกล้ความต้านทานรวมและเปลี่ยนไม่มากเมื่อหมุน",
        "วัดระหว่าง Wiper กับขาปลาย ค่าจะเปลี่ยนเมื่อหมุน สลับปลายสองด้านจะสลับทิศทางการเพิ่ม/ลดแรงดัน",
      ],
      reading: [
        "รหัสค่าที่ใช้ทั่วไป 103 = 10 kΩ, 102 = 1 kΩ; ตัวอักษร A/B ที่บอก taper ต้องตรวจผู้ผลิต ไม่เหมือนกันทุกระบบ",
        "ดูพิกัดกำลังและการใช้งานเป็น voltage divider หรือ variable resistor จาก datasheet",
      ],
      example:
        "Potentiometer 10 kΩ ต่อขาปลายเป็นวงจรแบ่งแรงดัน และอ่านแรงดันที่ Wiper ซึ่งเป็นขาสัญญาณออก",
      caution:
        "ไม่ใช้ Potentiometer สัญญาณเล็กเป็นตัวปรับกระแสโหลดกำลังสูงโดยไม่ตรวจพิกัด",
      sources: [
        {
          title: "Vishay: Potentiometer terminology",
          url: "https://www.vishay.com/doc?51001=",
        },
      ],
    },
    description:
      "ตัวต้านทานที่มีหน้าสัมผัสเลื่อน (Wiper) โดยทั่วไปมี 3 ขา สำหรับปรับอัตราส่วนแรงดัน",
    function:
      "ปรับระดับสัญญาณหรือแรงดันอ้างอิง สามารถใช้สองขาเป็นตัวต้านทานปรับค่าได้ภายในพิกัด",
    principle:
      "Wiper แบ่งแถบความต้านทานเป็นสองส่วน ตำแหน่งที่เปลี่ยนทำให้อัตราส่วนแรงดันที่ขากลางเปลี่ยน",
    identification:
      "มีแกนหมุน รางเลื่อน หรือสกรูปรับแบบ Trimmer มักมี 3 ขาและรหัสค่าความต้านทาน",
    applications: ["ปรับเสียง", "ตั้งแรงดันอ้างอิง", "ปรับเทียบวงจร"],
  },
  {
    id: "buzzer",
    classificationLabel: "Buzzer",
    name: "Buzzer",
    thaiName: "บัซเซอร์",
    type: "Electroacoustic",
    icon: "sound",
    guide: {
      polarity:
        "ตรวจเครื่องหมาย + / − และ datasheet รุ่นนั้น โดยเฉพาะ Active buzzer; รูปร่างอย่างเดียวไม่บอกชนิดและวิธีขับ",
      pins: [
        "ขาที่ทำเครื่องหมาย + ให้ต่อด้านบวกตามวงจรขับที่ผู้ผลิตกำหนด",
        "ความยาวขาใช้เป็นข้อสังเกตได้บางรุ่น แต่ให้ยึดเครื่องหมายและ pinout เป็นหลัก",
        "บัซเซอร์โมดูล 3 ขาอาจมี VCC, GND และ Signal แตกต่างจากชิ้นส่วนสองขา",
      ],
      reading: [
        "Active buzzer มีวงจรกำเนิดเสียงในตัว ส่วน Passive ต้องรับสัญญาณสลับ เช่น PWM ตามพิกัด",
        "อ่านแรงดัน กระแส และความถี่ Resonance จาก datasheet ไม่ทดลองจ่ายแรงดันสุ่ม",
      ],
      example:
        "Passive piezo sounder อาจไม่ดังต่อเนื่องเมื่อจ่าย DC ค้าง ต้องขับด้วยรูปคลื่นที่เหมาะสม",
      caution:
        "ไมโครคอนโทรลเลอร์อาจจ่ายกระแสขับไม่พอ ต้องใช้วงจรขับตามชนิดโหลดและพิกัดขา",
      sources: [
        {
          title: "TDK: Piezoelectric buzzers",
          url: "https://product.tdk.com/en/products/sw_piezo/buzzer/index.html",
        },
      ],
    },
    description:
      "อุปกรณ์สร้างเสียง มีทั้งแบบ Active ที่มีวงจรสร้างสัญญาณในตัว และ Passive ที่ต้องใช้สัญญาณขับ",
    function: "แจ้งเตือนหรือให้เสียงตอบรับการทำงาน",
    principle:
      "แผ่น Piezoelectric หรือกลไกแม่เหล็กสั่นเพื่อสร้างเสียง วิธีขับและแรงดันขึ้นกับชนิดและรุ่น",
    identification:
      "มักเป็นกระบอกมีรูเสียงด้านบนและขาต่อ อาจมีเครื่องหมาย + รูปร่างคล้ายกันไม่ได้บอกว่าเป็น Active หรือ Passive",
    applications: ["เสียงแจ้งเตือน", "เสียงตอบรับปุ่ม", "นาฬิกาปลุก"],
  },
  {
    id: "thermistor",
    classificationLabel: "Thermistor",
    name: "Thermistor",
    thaiName: "ตัวต้านทานไวอุณหภูมิ",
    type: "Sensor",
    icon: "temperature",
    guide: {
      polarity:
        "Thermistor สองขาทั่วไปไม่มีขั้ว + / − แต่ต้องแยกว่าเป็น NTC หรือ PTC",
      pins: [
        "ตัวชิ้นส่วนเปล่าสองขาต่อสลับด้านได้ หัวโพรบหรือโมดูลอาจมีการต่อเพิ่มเติมตามรุ่น",
        "อ่านเบอร์เพื่อแยกตัววัดอุณหภูมิออกจาก NTC จำกัดกระแสกระชากหรือ PTC ป้องกันกระแส",
      ],
      reading: [
        "ค่าพิกัดความต้านทานของเซนเซอร์มักระบุที่ 25°C เช่น R25 = 10 kΩ พร้อมค่า B หรือข้อมูลกราฟ",
        "NTC ความต้านทานลดลงเมื่ออุณหภูมิสูงขึ้น; PTC เพิ่มขึ้น การแปลงเป็น °C ต้องใช้สมการ/ตารางของรุ่น",
      ],
      example:
        "NTC 10 kΩ ที่ 25°C ไม่ได้มีค่า 10 kΩ ทุกอุณหภูมิ และเซนเซอร์ที่มี R25 เท่ากันอาจมีค่า B ต่างกัน",
      caution:
        "กระแสวัดสูงทำให้เกิด self-heating และคลาดเคลื่อน ไม่ใช้ไฟเผาหรือสัมผัสแรงดันสูงเพื่อทดลอง",
      sources: [
        {
          title: "Vishay: NTC thermistors",
          url: "https://www.vishay.com/en/thermistors/ntc/",
        },
      ],
    },
    description: "ตัวต้านทานที่ค่าเปลี่ยนตามอุณหภูมิ มีแบบ NTC และ PTC",
    function:
      "ตรวจวัดอุณหภูมิ ชดเชยอุณหภูมิ หรือจำกัดกระแสกระชากตามชนิดและพิกัด",
    principle:
      "NTC มีความต้านทานลดลงเมื่ออุณหภูมิเพิ่ม ส่วน PTC มีความต้านทานเพิ่มขึ้น ความสัมพันธ์มักไม่เป็นเส้นตรง",
    identification:
      "มีทั้งเม็ดกลม แผ่นดิสก์ หัวโพรบ และ SMD อาจคล้ายตัวเก็บประจุ ต้องอ่านรหัสหรือวัดการเปลี่ยนค่ากับอุณหภูมิ",
    applications: [
      "เซนเซอร์อุณหภูมิ",
      "จำกัด Inrush current ด้วย NTC",
      "ป้องกันกระแสเกินด้วย PTC ที่เหมาะสม",
    ],
  },
].map((component) => ({
  ...component,
  image: imageCredits[component.id]?.image,
  imageCredit: imageCredits[component.id],
  extraImages:
    component.id === "ir-led-photo-transistor" ? [imageCredits["ir-led"]] : [],
}));

export const componentByLabel = new Map(
  components.map((component) => [component.classificationLabel, component]),
);
export const expectedLabels = components.map(
  (component) => component.classificationLabel,
);

export const resistorColors = [
  { id: "black", name: "ดำ", digit: 0, multiplier: 1, hex: "#18181b" },
  {
    id: "brown",
    name: "น้ำตาล",
    digit: 1,
    multiplier: 10,
    tolerance: 1,
    hex: "#854d2a",
  },
  {
    id: "red",
    name: "แดง",
    digit: 2,
    multiplier: 100,
    tolerance: 2,
    hex: "#dc2626",
  },
  { id: "orange", name: "ส้ม", digit: 3, multiplier: 1000, hex: "#ea580c" },
  { id: "yellow", name: "เหลือง", digit: 4, multiplier: 10000, hex: "#facc15" },
  {
    id: "green",
    name: "เขียว",
    digit: 5,
    multiplier: 100000,
    tolerance: 0.5,
    hex: "#15803d",
  },
  {
    id: "blue",
    name: "น้ำเงิน",
    digit: 6,
    multiplier: 1000000,
    tolerance: 0.25,
    hex: "#2563eb",
  },
  {
    id: "violet",
    name: "ม่วง",
    digit: 7,
    multiplier: 10000000,
    tolerance: 0.1,
    hex: "#9333ea",
  },
  {
    id: "gray",
    name: "เทา",
    digit: 8,
    multiplier: 100000000,
    tolerance: 0.05,
    hex: "#64748b",
  },
  {
    id: "white",
    name: "ขาว",
    digit: 9,
    multiplier: 1000000000,
    hex: "#ffffff",
  },
  { id: "gold", name: "ทอง", multiplier: 0.1, tolerance: 5, hex: "#c99b38" },
  {
    id: "silver",
    name: "เงิน",
    multiplier: 0.01,
    tolerance: 10,
    hex: "#b8c3cf",
  },
];
