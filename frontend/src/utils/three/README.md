# Three.js Utilities

โฟลเดอร์สำหรับเก็บ utility functions ที่เกี่ยวกับ Three.js

## ไฟล์ที่มีอยู่

### `createSquareBlock.js`

สร้างบล็อกสี่เหลี่ยมจัตุรัส 3D จากมุมทั้ง 4 จุด

#### Usage

```javascript
import { createSquareBlock } from "./utils/three/index.js";
import * as THREE from "three";

const corners = [
  new THREE.Vector3(x1, y1, z1),
  new THREE.Vector3(x2, y2, z2),
  new THREE.Vector3(x3, y3, z3),
  new THREE.Vector3(x4, y4, z4),
];

const block = createSquareBlock(corners, {
  groundY: -2.6, // Y position ของพื้น
  height: 0.5, // ความสูงของบล็อก (optional)
  color: 0x00ff88, // สี (optional, default: 0x00ff88)
  opacity: 0.35, // ความโปร่งใส (optional, default: 0.35)
});

scene.add(block);
```

#### Options

- `groundY` (number): ค่า Y ของพื้นที่บล็อกจะติดกับ (default: ใช้ minY จาก corners)
- `height` (number): ความสูงของบล็อก (default: คำนวณจาก Y ของ corners)
- `color` (number): สีในรูปแบบ hex (default: 0x00ff88 - เขียว)
- `opacity` (number): ความโปร่งใส 0-1 (default: 0.35)

## การเพิ่มไฟล์ใหม่

เมื่อต้องการเพิ่ม utility function ใหม่:

1. สร้างไฟล์ `.js` ในโฟลเดอร์นี้
2. Export function จากไฟล์
3. เพิ่ม export ใน `index.js`
4. อัพเดท README.md นี้
