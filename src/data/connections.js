// Wiring examples adapted from CircuitLib and the local component guides.
export const connections = {
  "resistor": {
    "title": "ทดลองต่อให้ LED ติด",
    "note": "ตัวอย่างใช้ตัวต้านทาน 330 Ω ¼ W กับ LED สีแดง Vf ประมาณ 2 V ที่กระแสประมาณ 9 mA ตรวจค่าตัวต้านทานจริงก่อนต่อ AI บอกประเภทอุปกรณ์ แต่ไม่ได้อ่านค่าความต้านทานจากภาพ",
    "examples": [
      {
        "id": "led",
        "label": "ตัวต้านทาน + LED",
        "parts": [
          "ไฟ 5 V",
          "ตัวต้านทาน 330 Ω",
          "LED สีแดง"
        ],
        "wires": [
          {
            "from": {
              "part": "แหล่งจ่าย",
              "pin": "ขั้วบวก +5 V"
            },
            "to": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "LED",
              "pin": "ขาบวก A"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "LED",
              "pin": "ขาลบ K"
            },
            "to": {
              "part": "บอร์ด / แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          }
        ],
        "outcome": "LED ติด โดยมีตัวต้านทานช่วยจำกัดกระแส",
        "setup": "ตัวต้านทานไม่มีขั้ว ต่อสลับด้านได้",
        "checks": [
          "ถ้า LED ไม่ติด ให้ปิดไฟก่อนตรวจขั้ว A/K และค่า R 330 Ω",
          "ตรวจเลขรูในภาพ: A–E เลขเดียวกันเชื่อมถึงกัน ส่วน F–J เชื่อมกันอีกฝั่ง"
        ]
      }
    ]
  },
  "ceramic-capacitor": {
    "title": "ต่อกรองไฟเลี้ยงของ IC",
    "note": "ต่อคร่อมรางไฟ VCC กับ GND ใกล้ขาไฟของ IC ใช้สายสั้น และเลือกพิกัดแรงดันสูงกว่าไฟเลี้ยงตาม datasheet ไม่ต่ออนุกรมในสายไฟเลี้ยง",
    "examples": [
      {
        "id": "decoupling",
        "label": "เซรามิก 100 nF",
        "parts": [
          "C เซรามิก 100 nF (104)",
          "วงจร IC แรงดันต่ำ"
        ],
        "wires": [
          {
            "from": {
              "part": "วงจร IC",
              "pin": "VCC (ไฟบวก)"
            },
            "to": {
              "part": "C เซรามิก",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "C เซรามิก",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "วงจร IC",
              "pin": "GND"
            },
            "type": "ground"
          }
        ],
        "outcome": "ช่วยลดสัญญาณรบกวนที่ไฟเลี้ยงของ IC",
        "setup": "เซรามิกทั่วไปไม่มีขั้ว ต่อสลับด้านได้"
      }
    ]
  },
  "film-capacitor": {
    "title": "ต่อกรองสัญญาณแบบง่าย",
    "note": "ขาที่ระบุว่าจุดร่วมต้องเชื่อมถึงกันจริง เป็นตัวอย่างวงจร RC สำหรับสัญญาณแรงดันต่ำ ไม่ใช้ต่อไฟบ้าน",
    "examples": [
      {
        "id": "rc",
        "label": "วงจรกรอง RC",
        "parts": [
          "R 10 kΩ",
          "C ฟิล์ม 100 nF",
          "แหล่งสัญญาณแรงดันต่ำ"
        ],
        "wires": [
          {
            "from": {
              "part": "แหล่งสัญญาณ",
              "pin": "สัญญาณออก"
            },
            "to": {
              "part": "ตัวต้านทาน 10 kΩ",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 10 kΩ",
              "pin": "ขาอีกด้าน / จุดร่วม"
            },
            "to": {
              "part": "C ฟิล์ม 100 nF",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 10 kΩ",
              "pin": "ขาอีกด้าน / จุดร่วม"
            },
            "to": {
              "part": "วงจรรับสัญญาณ",
              "pin": "ขา OUT"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "C ฟิล์ม 100 nF",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "บอร์ด / แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          },
          {
            "from": {
              "part": "แหล่งสัญญาณ / วงจรรับ",
              "pin": "GND"
            },
            "to": {
              "part": "บอร์ด / แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          }
        ],
        "outcome": "อ่านสัญญาณที่ OUT ซึ่งถูกกรองความถี่สูงบางส่วน",
        "setup": "C ฟิล์มทั่วไปไม่มีขั้ว จุดร่วมเป็นจุดเดียวกับ OUT"
      }
    ]
  },
  "electrolytic-capacitor": {
    "title": "ต่อช่วยลดไฟกระเพื่อม",
    "note": "ห้ามกลับขั้วหรือใช้แรงดันเกินพิกัด ตัวอย่าง 100 µF / 16 V ใช้กับไฟ 5 V ก่อนถอดให้คายประจุผ่านตัวต้านทานที่เหมาะสม ห้ามลัดวงจรเพื่อคายประจุ",
    "examples": [
      {
        "id": "supply",
        "label": "ตัวเก็บประจุมีขั้ว",
        "parts": [
          "ไฟ 5 V",
          "C 100 µF / 16 V"
        ],
        "wires": [
          {
            "from": {
              "part": "แหล่งจ่าย",
              "pin": "ขั้วบวก +5 V"
            },
            "to": {
              "part": "C อิเล็กโทรไลต์",
              "pin": "ขา +"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "C อิเล็กโทรไลต์",
              "pin": "ขา − (ดูแถบ − บนตัวถัง)"
            },
            "to": {
              "part": "บอร์ด / แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          }
        ],
        "outcome": "ตัวเก็บประจุต่อคร่อมไฟเลี้ยง ช่วยลดไฟกระเพื่อม",
        "setup": "รุ่นมีขั้วต้องต่อ + และ − ให้ถูกต้อง"
      }
    ]
  },
  "diode": {
    "title": "ทดลองดูทิศทางกระแสของไดโอด",
    "examples": [
      {
        "id": "diode-led",
        "label": "ไดโอด 1N4007 + LED",
        "parts": [
          "ไฟ DC 5 V",
          "ไดโอด 1N4007",
          "LED สีแดง",
          "R 330 Ω"
        ],
        "setup": "ด้านมีแถบของไดโอดคือ Cathode (K)",
        "wires": [
          {
            "from": {
              "part": "แหล่งจ่าย 5 V",
              "pin": "ขั้วบวก +"
            },
            "to": {
              "part": "ไดโอด 1N4007",
              "pin": "A (ไม่มีแถบ)"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "ไดโอด 1N4007",
              "pin": "K (มีแถบ)"
            },
            "to": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "LED สีแดง",
              "pin": "ขาบวก A"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "LED สีแดง",
              "pin": "ขาลบ K"
            },
            "to": {
              "part": "แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          }
        ],
        "outcome": "ต่อไดโอดถูกทิศ → LED ติด / กลับทิศไดโอด → LED ดับ",
        "checks": [
          "ปิดไฟก่อนกลับทิศไดโอดเพื่อทดลอง",
          "ถ้า LED ดับทั้งสองทิศ ตรวจขั้ว LED ตัวต้านทาน และแหล่งจ่าย"
        ]
      }
    ],
    "note": "ตัวอย่างใช้ 1N4007 ต่ออนุกรมกับ LED จึงมีแรงดันตกคร่อมที่ไดโอดด้วย ใช้ไฟ DC 5 V เท่านั้น ไม่ใช้แทนวงจรไฟบ้าน",
    "sources": [
      {
        "title": "SparkFun: Diode applications",
        "url": "https://learn.sparkfun.com/tutorials/diodes/diode-applications"
      }
    ]
  },
  "transistor": {
    "title": "ทดลองใช้ทรานซิสเตอร์เปิด LED",
    "examples": [
      {
        "id": "npn-switch",
        "label": "NPN 2N3904 + ปุ่มกด",
        "parts": [
          "ไฟ DC 5 V",
          "NPN 2N3904",
          "ปุ่มกด NO",
          "LED สีแดง",
          "R 330 Ω / 4.7 kΩ / 100 kΩ"
        ],
        "setup": "ตรวจขา E/B/C จาก datasheet ของรุ่นจริงก่อนเสียบ",
        "wires": [
          {
            "from": {
              "part": "แหล่งจ่าย 5 V",
              "pin": "ขั้วบวก +"
            },
            "to": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "LED สีแดง",
              "pin": "ขาบวก A"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "LED สีแดง",
              "pin": "ขาลบ K"
            },
            "to": {
              "part": "2N3904",
              "pin": "Collector (C)"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "2N3904",
              "pin": "Emitter (E)"
            },
            "to": {
              "part": "แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          },
          {
            "from": {
              "part": "แหล่งจ่าย 5 V",
              "pin": "ขั้วบวก +"
            },
            "to": {
              "part": "ปุ่มกด NO",
              "pin": "หน้าสัมผัสฝั่งที่ 1"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "ปุ่มกด NO",
              "pin": "หน้าสัมผัสฝั่งที่ 2"
            },
            "to": {
              "part": "ตัวต้านทาน 4.7 kΩ",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 4.7 kΩ",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "2N3904",
              "pin": "Base (B)"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "2N3904",
              "pin": "Base (B)"
            },
            "to": {
              "part": "ตัวต้านทาน 100 kΩ",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 100 kΩ",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          }
        ],
        "outcome": "กดปุ่ม → LED ติด / ปล่อยปุ่ม → LED ดับ",
        "checks": [
          "ถ้าไม่ติด ตรวจขา E/B/C ให้ตรง datasheet และขั้ว LED",
          "ถ้าติดตลอด ตรวจปุ่ม NO และ R 100 kΩ ระหว่าง B กับ GND"
        ]
      }
    ],
    "note": "ภาพแสดงตัวอย่างหลังระบุขา E/B/C แล้ว ไม่ใช่ผังขาตายตัวสำหรับทรานซิสเตอร์ทุกเบอร์ ใช้ NPN 2N3904 เท่านั้น ไม่ใช้แทน PNP หรือ MOSFET",
    "sources": [
      {
        "title": "onsemi: 2N3904 datasheet",
        "url": "https://www.onsemi.com/pdf/datasheet/2n3904-d.pdf"
      }
    ]
  },
  "led": {
    "title": "ต่อ LED ให้ติดอย่างถูกขั้ว",
    "note": "ตัวอย่างสมมติ LED สีแดง Vf ประมาณ 2 V กระแสประมาณ 9 mA ห้ามต่อ LED เปล่าตรงกับแหล่งจ่าย เลือก R ด้วย R = (แรงดันจ่าย − Vf) ÷ กระแสตามพิกัด LED",
    "examples": [
      {
        "id": "red-led",
        "label": "LED สีแดง",
        "parts": [
          "ไฟ 5 V",
          "R 330 Ω",
          "LED สีแดง"
        ],
        "wires": [
          {
            "from": {
              "part": "แหล่งจ่าย",
              "pin": "ขั้วบวก +5 V"
            },
            "to": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "LED",
              "pin": "ขาบวก A"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "LED",
              "pin": "ขาลบ K"
            },
            "to": {
              "part": "บอร์ด / แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          }
        ],
        "outcome": "เมื่อเปิดไฟ LED จะสว่าง",
        "setup": "A = ขาบวก / K = ขาลบ ตรวจเครื่องหมายหรือ datasheet",
        "checks": [
          "ถ้า LED ไม่ติด ให้ปิดไฟก่อนตรวจขั้ว A/K และค่า R 330 Ω",
          "ตรวจเลขรูในภาพ: A–E เลขเดียวกันเชื่อมถึงกัน ส่วน F–J เชื่อมกันอีกฝั่ง"
        ]
      }
    ]
  },
  "ir-led-photo-transistor": {
    "title": "เลือกก่อนว่าเป็นตัวรับหรือตัวส่ง",
    "note": "ตัวรับ NPN ใช้ขา C/E ส่วน IR LED ใช้ A/K ต้องตรวจเบอร์จริงและย่านแสงที่รองรับ โมเดลปัจจุบันฝึกเฉพาะ Photo transistor ไม่ยืนยันว่าเป็นตัวรับอินฟราเรด",
    "examples": [
      {
        "id": "receiver",
        "label": "ตัวรับแสง",
        "parts": [
          "Photo transistor แบบ NPN",
          "R 10 kΩ",
          "บอร์ด Analog 3.3 V"
        ],
        "wires": [
          {
            "from": {
              "part": "บอร์ด",
              "pin": "ขา 3.3 V"
            },
            "to": {
              "part": "ตัวต้านทาน 10 kΩ",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 10 kΩ",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "Photo transistor",
              "pin": "Collector (C)"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "Photo transistor",
              "pin": "Collector (C) / จุดอ่าน"
            },
            "to": {
              "part": "บอร์ด",
              "pin": "A0"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "Photo transistor",
              "pin": "Emitter (E)"
            },
            "to": {
              "part": "บอร์ด / แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          }
        ],
        "outcome": "รับแสงมากขึ้น → แรงดันที่ A0 ลดลง",
        "setup": "ใช้กับ Photo transistor แบบ NPN ที่รองรับไฟ 3.3 V"
      },
      {
        "id": "transmitter",
        "label": "ตัวส่ง IR LED",
        "parts": [
          "ไฟ 3.3 V",
          "IR LED",
          "R 330 Ω"
        ],
        "wires": [
          {
            "from": {
              "part": "บอร์ด",
              "pin": "ขา 3.3 V"
            },
            "to": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "IR LED",
              "pin": "Anode (A) ขาบวก"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "IR LED",
              "pin": "Cathode (K) ขาลบ"
            },
            "to": {
              "part": "บอร์ด / แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          }
        ],
        "outcome": "IR LED ส่งแสงอินฟราเรด ซึ่งตาเปล่ามักมองไม่เห็น",
        "setup": "ตรวจ Vf และกระแสของ IR LED ก่อนใช้ตัวอย่างนี้"
      }
    ]
  },
  "switch": {
    "title": "ทดลองกดปุ่มเพื่อเปิด LED",
    "examples": [
      {
        "id": "switch-led",
        "label": "ปุ่มกดเปิด LED",
        "parts": [
          "ไฟ DC 5 V",
          "ปุ่มกด NO",
          "LED สีแดง",
          "R 330 Ω"
        ],
        "setup": "ใช้คู่ขาที่เชื่อมถึงกันเฉพาะตอนกด",
        "wires": [
          {
            "from": {
              "part": "แหล่งจ่าย 5 V",
              "pin": "ขั้วบวก +"
            },
            "to": {
              "part": "ปุ่มกด NO",
              "pin": "หน้าสัมผัสฝั่งที่ 1"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "ปุ่มกด NO",
              "pin": "หน้าสัมผัสฝั่งที่ 2"
            },
            "to": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "LED สีแดง",
              "pin": "ขาบวก A"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "LED สีแดง",
              "pin": "ขาลบ K"
            },
            "to": {
              "part": "แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          }
        ],
        "outcome": "กดปุ่ม → LED ติด / ปล่อยปุ่ม → LED ดับ",
        "checks": [
          "LED ติดตลอด: ตรวจว่าขาสวิตช์ไม่ได้เสียบในแถวเดียวกัน",
          "กดแล้วไม่ติด: ตรวจขั้ว LED ค่า R และแรงดันที่รางไฟ"
        ]
      }
    ],
    "note": "ใช้มัลติมิเตอร์หาคู่หน้าสัมผัสขณะปิดไฟ ปุ่ม 4 ขามักมีคู่ขาที่ต่อถึงกันอยู่แล้ว ภาพแสดงเฉพาะหน้าสัมผัสสองขาที่เลือกใช้ ตำแหน่งรูต้องปรับให้ตรงกับระยะขาจริง",
    "sources": [
      {
        "title": "SparkFun: Button and Switch Basics",
        "url": "https://learn.sparkfun.com/tutorials/button-and-switch-basics/all"
      }
    ]
  },
  "photoresistor": {
    "title": "ต่อ LDR เพื่ออ่านระดับแสง",
    "note": "ใช้แรงดันที่ขา Analog รองรับ เช่น 3.3 V สำหรับบอร์ด 3.3 V จุดร่วมต้องเชื่อมถึงกัน ค่า Analog ไม่ใช่ค่า lux ต้องปรับเทียบหากต้องการวัดแสง",
    "examples": [
      {
        "id": "ldr",
        "label": "เซนเซอร์แสง",
        "parts": [
          "LDR",
          "R 10 kΩ",
          "บอร์ด Analog 3.3 V"
        ],
        "wires": [
          {
            "from": {
              "part": "บอร์ด",
              "pin": "ขา 3.3 V"
            },
            "to": {
              "part": "LDR",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "LDR",
              "pin": "ขาอีกด้าน / จุดร่วม"
            },
            "to": {
              "part": "ตัวต้านทาน 10 kΩ",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "LDR",
              "pin": "ขาอีกด้าน / จุดร่วม"
            },
            "to": {
              "part": "บอร์ด",
              "pin": "A0"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 10 kΩ",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "บอร์ด / แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          }
        ],
        "outcome": "แสงมากขึ้น → แรงดันที่ A0 สูงขึ้น",
        "setup": "LDR ไม่มีขั้ว ต่อสลับด้านได้"
      }
    ]
  },
  "seven-segment": {
    "title": "ทดลองเปิดเพียงขีดเดียวก่อน",
    "note": "ตัวอย่างสำหรับจอ LED สีแดง ใช้ R 330 Ω กับสัญญาณ 3.3 V เมื่อพิกัดรองรับ ตรวจผัง COM และ a จาก datasheet หากเปิดหลายขีดต้องมี R แยกทุกขีด และตรวจพิกัดกระแสรวมของบอร์ด",
    "examples": [
      {
        "id": "cathode",
        "label": "ขาร่วมลบ (CC)",
        "parts": [
          "จอ Common cathode",
          "R 330 Ω",
          "บอร์ด GPIO 3.3 V"
        ],
        "wires": [
          {
            "from": {
              "part": "บอร์ด",
              "pin": "GPIO 3.3 V"
            },
            "to": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "จอ 7-Segment",
              "pin": "ขา a"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "จอ 7-Segment",
              "pin": "ขา COM ทุกขาที่ datasheet ระบุ"
            },
            "to": {
              "part": "บอร์ด / แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          }
        ],
        "outcome": "GPIO เป็น HIGH → ขีด a ติด",
        "setup": "เลือกแบบนี้เฉพาะจอ Common cathode"
      },
      {
        "id": "anode",
        "label": "ขาร่วมบวก (CA)",
        "parts": [
          "จอ Common anode",
          "R 330 Ω",
          "บอร์ด GPIO 3.3 V"
        ],
        "wires": [
          {
            "from": {
              "part": "บอร์ด",
              "pin": "ขา 3.3 V"
            },
            "to": {
              "part": "จอ 7-Segment",
              "pin": "ขา COM ทุกขาที่ datasheet ระบุ"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "จอ 7-Segment",
              "pin": "ขา a"
            },
            "to": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 330 Ω",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "บอร์ด",
              "pin": "GPIO"
            },
            "type": "signal"
          }
        ],
        "outcome": "GPIO เป็น LOW → ขีด a ติด",
        "setup": "เลือกแบบนี้เฉพาะจอ Common anode"
      }
    ]
  },
  "potentiometer": {
    "title": "ต่อปุ่มหมุนเพื่อปรับค่า Analog",
    "note": "ตรวจขา Wiper จากเบอร์หรือมัลติมิเตอร์ก่อนต่อ ขากลางมักเป็น Wiper แต่ไม่ได้ใช้กฎนี้ได้ทุกแบบ สลับขาปลายได้ถ้าต้องการกลับทิศทางการหมุน",
    "sources": [
      {
        "title": "Arduino: Analog Read Serial",
        "url": "https://docs.arduino.cc/built-in-examples/basics/AnalogReadSerial/"
      }
    ],
    "examples": [
      {
        "id": "divider",
        "label": "ตัวต้านทานปรับค่า 10 kΩ",
        "parts": [
          "Potentiometer 10 kΩ",
          "บอร์ด Analog 3.3 V"
        ],
        "wires": [
          {
            "from": {
              "part": "บอร์ด",
              "pin": "ขา 3.3 V"
            },
            "to": {
              "part": "Potentiometer",
              "pin": "ขาปลายฝั่งที่ 1"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "Potentiometer",
              "pin": "ขาปลายฝั่งที่ 2"
            },
            "to": {
              "part": "บอร์ด / แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          },
          {
            "from": {
              "part": "Potentiometer",
              "pin": "Wiper (ขาเลื่อน)"
            },
            "to": {
              "part": "บอร์ด",
              "pin": "A0"
            },
            "type": "signal"
          }
        ],
        "outcome": "หมุนแกน → ค่าที่ A0 เปลี่ยน",
        "setup": "ใช้กับบอร์ดที่ขา Analog รับแรงดัน 3.3 V ได้"
      }
    ]
  },
  "buzzer": {
    "title": "ต่อบัซเซอร์ผ่านทรานซิสเตอร์",
    "note": "ตัวอย่างจำกัดเฉพาะ Active piezo 3 V กระแสไม่เกิน 10 mA ผ่าน NPN 2N3904 ตรวจพิกัดและขา B/C/E แนะนำเพิ่ม R 10 kΩ ระหว่าง B กับ GND รุ่น Passive ต้องใช้สัญญาณ PWM ตาม datasheet ส่วนรุ่นแม่เหล็กอาจต้องมีไดโอดป้องกันแรงดันย้อน",
    "examples": [
      {
        "id": "active",
        "label": "Active piezo 3 V",
        "parts": [
          "Active piezo 3 V ≤10 mA",
          "NPN 2N3904",
          "R 1 kΩ",
          "ไฟ 3 V / GPIO 3.3 V"
        ],
        "wires": [
          {
            "from": {
              "part": "แหล่งจ่าย 3 V",
              "pin": "ขั้วบวก"
            },
            "to": {
              "part": "Buzzer",
              "pin": "ขา +"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "Buzzer",
              "pin": "ขา −"
            },
            "to": {
              "part": "NPN 2N3904",
              "pin": "Collector (C)"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "NPN 2N3904",
              "pin": "Emitter (E)"
            },
            "to": {
              "part": "บอร์ด / แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          },
          {
            "from": {
              "part": "บอร์ดควบคุม",
              "pin": "GPIO 3.3 V"
            },
            "to": {
              "part": "ตัวต้านทาน 1 kΩ",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 1 kΩ",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "NPN 2N3904",
              "pin": "Base (B)"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "บอร์ดควบคุม",
              "pin": "GND"
            },
            "to": {
              "part": "บอร์ด / แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          }
        ],
        "outcome": "GPIO เป็น HIGH → เสียงดัง / LOW → เงียบ",
        "setup": "ใช้ตัวอย่างนี้กับ Active piezo ตามพิกัดที่ระบุเท่านั้น"
      }
    ]
  },
  "thermistor": {
    "title": "ต่อ NTC เพื่ออ่านอุณหภูมิ",
    "note": "จุดร่วมเป็นจุดเดียวกัน ใช้ NTC สำหรับวัดอุณหภูมิ 10 kΩ ที่ 25°C ตรวจค่า B หรือกราฟของรุ่นเพื่อแปลงเป็น °C ไม่ใช้แทน NTC จำกัดกระแสกระชากหรือ PTC",
    "sources": [
      {
        "title": "Adafruit: Using a Thermistor",
        "url": "https://learn.adafruit.com/thermistor/using-a-thermistor"
      }
    ],
    "examples": [
      {
        "id": "ntc",
        "label": "NTC 10 kΩ",
        "parts": [
          "NTC 10 kΩ ที่ 25°C",
          "R 10 kΩ",
          "บอร์ด Analog 3.3 V"
        ],
        "wires": [
          {
            "from": {
              "part": "บอร์ด",
              "pin": "ขา 3.3 V"
            },
            "to": {
              "part": "ตัวต้านทาน 10 kΩ",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "power"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 10 kΩ",
              "pin": "ขาอีกด้าน / จุดร่วม"
            },
            "to": {
              "part": "NTC",
              "pin": "ขาด้านหนึ่ง"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "ตัวต้านทาน 10 kΩ",
              "pin": "ขาอีกด้าน / จุดร่วม"
            },
            "to": {
              "part": "บอร์ด",
              "pin": "A0"
            },
            "type": "signal"
          },
          {
            "from": {
              "part": "NTC",
              "pin": "ขาอีกด้าน"
            },
            "to": {
              "part": "บอร์ด / แหล่งจ่าย",
              "pin": "GND (ขั้วลบ)"
            },
            "type": "ground"
          }
        ],
        "outcome": "NTC อุ่นขึ้น → แรงดันที่ A0 ลดลง",
        "setup": "NTC สองขาทั่วไปไม่มีขั้ว ใช้ไฟตามพิกัด Analog ของบอร์ด"
      }
    ]
  }
};
