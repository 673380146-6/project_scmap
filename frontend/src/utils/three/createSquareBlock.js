import * as THREE from 'three'

/**
 * สร้างบล็อกสี่เหลี่ยมจัตุรัส 3D จากมุมทั้ง 4 จุด
 * @param {Array<THREE.Vector3>} corners - อาร์เรย์ของ Vector3 ที่เป็นมุมทั้ง 4 ของสี่เหลี่ยม (ต้องมี 4 จุด)
 * @param {Object} options - ตัวเลือกเพิ่มเติม
 * @param {number} options.groundY - ค่า Y ของพื้น (default: จะใช้ minY จาก corners)
 * @param {number} options.height - ความสูงของบล็อก (default: คำนวณจาก Y ของ corners)
 * @param {number} options.color - สีของบล็อก (default: 0x00ff88)
 * @param {number} options.opacity - ความโปร่งใส (default: 0.35)
 * @returns {THREE.Group} Group ที่มี mesh และ edges ของบล็อกสี่เหลี่ยม
 */
export function createSquareBlock(corners, options = {}) {
  const group = new THREE.Group()

  if (!corners || corners.length !== 4) {
    console.error('createSquareBlock: ต้องมีมุม 4 จุด')
    return group
  }

  // ตรวจสอบว่า corners เป็น Vector3 หรือไม่
  const vector3Corners = corners.map(corner => {
    if (corner instanceof THREE.Vector3) {
      return corner
    }
    return new THREE.Vector3(corner.x, corner.y, corner.z)
  })

  // คำนวณ center ของสี่เหลี่ยม
  const centerX = (vector3Corners[0].x + vector3Corners[1].x + vector3Corners[2].x + vector3Corners[3].x) / 4
  const centerZ = (vector3Corners[0].z + vector3Corners[1].z + vector3Corners[2].z + vector3Corners[3].z) / 4

  // คำนวณความยาวด้านต่างๆ
  const side1 = Math.sqrt(
    Math.pow(vector3Corners[1].x - vector3Corners[0].x, 2) + Math.pow(vector3Corners[1].z - vector3Corners[0].z, 2)
  ) // ซ้าย -> ขวา
  const side2 = Math.sqrt(
    Math.pow(vector3Corners[2].x - vector3Corners[1].x, 2) + Math.pow(vector3Corners[2].z - vector3Corners[1].z, 2)
  ) // ขวา -> หลังขวา
  const side3 = Math.sqrt(
    Math.pow(vector3Corners[3].x - vector3Corners[2].x, 2) + Math.pow(vector3Corners[3].z - vector3Corners[2].z, 2)
  ) // หลังขวา -> หลังซ้าย
  const side4 = Math.sqrt(
    Math.pow(vector3Corners[0].x - vector3Corners[3].x, 2) + Math.pow(vector3Corners[0].z - vector3Corners[3].z, 2)
  ) // หลังซ้าย -> ซ้าย

  // หาค่าเฉลี่ยของความยาวด้านทั้งหมด
  const avgSideLength = (side1 + side2 + side3 + side4) / 4

  // หามุมของด้านแรก (ซ้าย -> ขวา) เพื่อใช้หมุน square
  const firstAngle = Math.atan2(vector3Corners[1].z - vector3Corners[0].z, vector3Corners[1].x - vector3Corners[0].x)

  // สร้างสี่เหลี่ยมจัตุรัสที่ origin โดยใช้ความยาวเฉลี่ย
  const halfSize = avgSideLength / 2
  const squareShape = new THREE.Shape()
  squareShape.moveTo(-halfSize, -halfSize)
  squareShape.lineTo(halfSize, -halfSize)
  squareShape.lineTo(halfSize, halfSize)
  squareShape.lineTo(-halfSize, halfSize)
  squareShape.closePath()

  // คำนวณความสูง
  const minY = Math.min(vector3Corners[0].y, vector3Corners[1].y, vector3Corners[2].y, vector3Corners[3].y)
  const maxY = Math.max(vector3Corners[0].y, vector3Corners[1].y, vector3Corners[2].y, vector3Corners[3].y)
  const boxHeight = options.height || ((maxY !== minY) ? (maxY - minY) + 0.3 : 0.5)
  const groundY = options.groundY !== undefined ? options.groundY : minY

  // สร้าง ExtrudeGeometry เพื่อให้เป็น 3D Box (มีความสูง)
  const extrudeSettings = {
    depth: boxHeight,
    bevelEnabled: false,
    bevelThickness: 0,
    bevelSize: 0,
    bevelSegments: 1
  }

  const geometry = new THREE.ExtrudeGeometry(squareShape, extrudeSettings)

  // Material
  const color = options.color !== undefined ? options.color : 0x00ff88
  const opacity = options.opacity !== undefined ? options.opacity : 0.35
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: opacity,
    side: THREE.DoubleSide,
    wireframe: false,
    depthWrite: false
  })

  const mesh = new THREE.Mesh(geometry, material)

  // Rotate ให้ราบกับพื้น XZ plane (ExtrudeGeometry extrude ตาม +Z)
  mesh.rotation.x = -Math.PI / 2
  // หมุนตามมุมของสี่เหลี่ยมเดิม
  mesh.rotation.y = firstAngle

  // ตั้งค่า position ให้ฐานอยู่ที่พื้น
  // ExtrudeGeometry extrude ตาม +Z (depth = boxHeight)
  // หลังจาก rotate.x = -90 องศา: Shape อยู่ใน XZ plane, extrude ไปที่ -Y direction
  // Geometry จะอยู่ระหว่าง Y = 0 ถึง Y = -boxHeight (relative to mesh position)
  // ดังนั้นต้องตั้ง position.y = groundY + boxHeight เพื่อให้ฐานอยู่ที่ groundY
  mesh.position.set(centerX, groundY + boxHeight, centerZ)

  // สร้าง edges เพื่อให้เห็นโครงสร้าง 3D ชัดเจน
  const edgesGeometry = new THREE.EdgesGeometry(geometry)
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: color,
    linewidth: 2,
    transparent: true,
    opacity: opacity + 0.55 // edges จะเข้มกว่า mesh นิดหน่อย
  })
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
  edges.rotation.x = -Math.PI / 2
  edges.rotation.y = firstAngle
  edges.position.set(centerX, groundY + boxHeight, centerZ)

  group.add(mesh)
  group.add(edges)

  return group
}

/**
 * สร้างบล็อกสี่เหลี่ยมจัตุรัส 3D จากมุมทั้ง 4 จุด (alias สำหรับ createSquareBlock)
 */
export { createSquareBlock as createParkingArea }

