# วิธีปรับแต่งพิกัด Marker

## ขั้นตอนการปรับแต่งพิกัดให้แม่นยำ:

### 1. เปิดเว็บไซต์และทดสอบ
- เปิด http://localhost:5175/
- ไปที่หน้าแผนที่ (กดปุ่ม "ดูแผนที่")
- ค้นหาห้อง เช่น "CP9127"
- คลิกที่ผลการค้นหาเพื่อแสดง marker

### 2. ใช้ปุ่มกดเพื่อปรับแต่งตำแหน่ง marker:
- **ลูกศรซ้าย/ขวา**: เลื่อน marker ไปซ้าย/ขวา
- **ลูกศรขึ้น/ลง**: เลื่อน marker ไปข้างหน้า/หลัง  
- **Page Up/Page Down**: เลื่อน marker ขึ้น/ลง

### 3. ดูพิกัดใหม่ใน Console:
- กด F12 เพื่อเปิด Developer Tools
- ดูใน Console จะแสดงพิกัดใหม่ เช่น:
```
Room CP9127 new position: { x: 12, y: 6, z: -8 }
```

### 4. อัพเดทฐานข้อมูลในโค้ด:
เปิดไฟล์ `frontend/src/pages/map.vue` และแก้ไขพิกัดในบรรทัดที่ 145:

**เดิม:**
```javascript
'CP9127': { building: 'SC09', floor: 1, room: 'CP9127', description: 'ห้องปฏิบัติการโปรแกรมมิ่ง', position: { x: 15, y: 2, z: -3 } }
```

**แก้ไขเป็น:**
```javascript
'CP9127': { building: 'SC09', floor: 1, room: 'CP9127', description: 'ห้องปฏิบัติการโปรแกรมมิ่ง', position: { x: 12, y: 6, z: -8 } }
```

### 5. ทำซ้ำกับห้องอื่นๆ:
ปรับแต่งพิกัดของห้องอื่นๆ ที่ต้องการให้แม่นยำ

## ตัวอย่างการแก้ไขพิกัดทั้งหมด:

```javascript
const rooms = {
  // ตึก SC01
  'SC0101': { building: 'SC01', floor: 1, room: 'SC0101', description: 'ห้องเรียน', position: { x: -12, y: 2, z: 8 } },
  'SC0102': { building: 'SC01', floor: 1, room: 'SC0102', description: 'ห้องปฏิบัติการ', position: { x: -10, y: 2, z: 8 } },
  'SC0201': { building: 'SC01', floor: 2, room: 'SC0201', description: 'ห้องเรียน', position: { x: -12, y: 6, z: 8 } },
  
  // ตึก SC08  
  'SC0801': { building: 'SC08', floor: 1, room: 'SC0801', description: 'ห้องเรียน', position: { x: 0, y: 2, z: 2 } },
  'SC0802': { building: 'SC08', floor: 1, room: 'SC0802', description: 'ห้องปฏิบัติการ', position: { x: 2, y: 2, z: 2 } },
  'SC0803': { building: 'SC08', floor: 1, room: 'SC0803', description: 'ห้องสำนักงาน', position: { x: 4, y: 2, z: 2 } },
  
  // ตึก SC09
  'CP9101': { building: 'SC09', floor: 1, room: 'CP9101', description: 'ห้องเรียนคอมพิวเตอร์', position: { x: 12, y: 2, z: -8 } },
  'CP9102': { building: 'SC09', floor: 1, room: 'CP9102', description: 'ห้องปฏิบัติการคอมพิวเตอร์', position: { x: 14, y: 2, z: -8 } },
  'CP9127': { building: 'SC09', floor: 1, room: 'CP9127', description: 'ห้องปฏิบัติการโปรแกรมมิ่ง', position: { x: 16, y: 2, z: -6 } },
  'CP9201': { building: 'SC09', floor: 2, room: 'CP9201', description: 'ห้องวิจัย', position: { x: 12, y: 6, z: -8 } },
  'CP9301': { building: 'SC09', floor: 3, room: 'CP9301', description: 'ห้องสัมมนา', position: { x: 12, y: 10, z: -8 } },
}
```

## หมายเหตุ:
- การปรับแต่งด้วยปุ่มกดจะทำงานเฉพาะเมื่อมี marker แสดงอยู่
- ควรปรับแต่งที่ละห้องและบันทึกพิกัดใหม่
- หลังจากแก้ไขพิกัดแล้ว ให้รีเฟรชหน้าเว็บเพื่อทดสอบ