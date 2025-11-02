<template>
  <div class="container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">S</div>
        <div class="label">SCIENCE MAP</div>
      </div>

      <div class="search-box">
        <div class="icon">🔎</div>
        <!-- แทน onkeyup="filterList()" ด้วย v-model + @input -->
        <input type="text" placeholder="ค้นหา..." v-model="searchQuery" @input="filterList" />
      </div>

      <ul class="menu-list">
        <li
          class="menu-item has-sub"
          v-for="item in menuItems"
          :key="item.name"
          @click.stop="item.submenu ? toggleSubmenu(item.name) : showCanvas(item.name)"
        >
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>

          <!-- render submenu inside its parent li to keep valid HTML structure -->
          <div
            v-if="item.submenu"
            class="submenu"
            :class="{ open: openSubmenus.includes(item.name) }"
          >
            <div
              v-for="sub in item.submenu"
              :key="item.name + '-' + sub"
              class="sub-item"
              @click.stop="showCanvas(sub)"
            >
              {{ sub }}
            </div>
          </div>
        </li>
      </ul>
    </aside>

    <!-- Main -->
    <main class="main">
      <div class="top-bar">
        <div class="title">{{ user.fullName || "SCIENCE MAP ADMIN" }}</div>
        <button class="logout-btn" @click="logoutUser">🚪 ออกจากระบบ</button>
        <div class="settings" :class="{ active: settingsActive }" @click.stop="toggleSettingsMenu">
          <svg viewBox="0 0 24 24">
            <path
              d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.43-3.5c0-.36-.03-.72-.08-1.07l2.11-1.65a.5.5 0 0 0 .12-.65l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.16 7.16 0 0 0-1.84-1.07L14.5 2.5a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5l-.24 2.88a7.16 7.16 0 0 0-1.84 1.07l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.65l2.11 1.65c-.05.35-.08.71-.08 1.07s.03.72.08 1.07l-2.11 1.65a.5.5 0 0 0-.12.65l2 3.46a.5.5 0 0 0 .61.22l2.49-1a7.16 7.16 0 0 0 1.84 1.07L9.5 21.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5l.24-2.88a7.16 7.16 0 0 0 1.84-1.07l2.49 1a.5.5 0 0 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.65l-2.11-1.65c.05-.35.08-.71.08-1.07z"
            />
          </svg>
          <div class="settings-menu">
            <div class="profile-info">
              <div class="name">{{ user.fullName || "แอดมิน" }}</div>
              <div class="faculty-major">{{ user.faculty || "" }}{{ user.major ? " | " + user.major : "" }}</div>
            </div>
            <a href="#" class="logout" @click.prevent="logoutUser">ออกจากระบบ</a>
          </div>
        </div>
      </div>

      <div class="canvas-area" v-show="canvasVisible">
        <div v-html="canvasContent"></div>
      </div>

      <div v-show="usersVisible">
        <h3>รายชื่อผู้สมัคร (Users)</h3>
        <button class="btn primary" @click="addUser">➕ เพิ่มผู้สมัคร</button>
        <table>
          <thead>
            <tr><th>ชื่อผู้ใช้</th></tr>
          </thead>
          <tbody>
            <tr v-for="userItem in users" :key="userItem.id">
              <td contenteditable @blur="updateUser(userItem, $event)">{{ userItem.user }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- SC09 Floor Management Section -->
      <div class="sc09-management" v-show="sc09Visible">
        <h2>จัดการข้อมูลชั้น SC09</h2>
        
        <!-- Form สำหรับเพิ่ม/แก้ไขข้อมูล -->
        <div class="form-section">
          <h3>{{ editingFloor ? 'แก้ไขข้อมูลชั้น' : 'เพิ่มข้อมูลชั้นใหม่' }}</h3>
          
          <form @submit.prevent="saveFloorData" class="floor-form">
            <div class="form-group">
              <label>หมายเลขชั้น:</label>
              <select v-model="formData.floorId" :disabled="editingFloor" required>
                <option value="">เลือกชั้น</option>
                <option v-for="floor in availableFloors" :key="floor.id" :value="floor.id">
                  {{ floor.number }} - {{ floor.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>รายละเอียดชั้น:</label>
              <textarea 
                v-model="formData.description" 
                placeholder="ใส่รายละเอียดของชั้น..."
                rows="4"
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label>สิ่งอำนวยความสะดวก:</label>
              <div class="facilities-input">
                <input 
                  v-model="newFacility" 
                  @keyup.enter="addFacility"
                  placeholder="ใส่สิ่งอำนวยความสะดวก แล้วกด Enter"
                  type="text"
                />
                <button type="button" @click="addFacility" class="btn primary">เพิ่ม</button>
              </div>
              
              <div class="facilities-list" v-if="formData.facilities.length > 0">
                <span 
                  v-for="(facility, index) in formData.facilities" 
                  :key="index"
                  class="facility-tag"
                >
                  {{ facility }}
                  <button type="button" @click="removeFacility(index)" class="btn-remove">×</button>
                </span>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn primary" :disabled="saving">
                <span v-if="saving">กำลังบันทึก...</span>
                <span v-else>{{ editingFloor ? 'อัพเดท' : 'บันทึก' }}</span>
              </button>
              <button type="button" @click="resetForm" class="btn ghost">ยกเลิก</button>
            </div>
          </form>
        </div>

        <!-- รายการข้อมูลที่มีอยู่ -->
        <div class="data-section">
          <h3>ข้อมูลชั้นที่มีอยู่</h3>
          
          <div class="loading" v-if="floorLoading">กำลังโหลดข้อมูล...</div>
          
          <div class="floor-cards" v-else>
            <div 
              v-for="(data, floorId) in floorData" 
              :key="floorId"
              class="floor-card"
            >
              <div class="floor-header">
                <h4>{{ getFloorName(floorId) }}</h4>
                <div class="floor-actions">
                  <button @click="editFloor(floorId)" class="btn ghost">แก้ไข</button>
                  <button @click="deleteFloor(floorId)" class="btn-delete">ลบ</button>
                </div>
              </div>
              
              <div class="floor-content">
                <p><strong>รายละเอียด:</strong> {{ data.description }}</p>
                <div class="facilities" v-if="data.facilities && data.facilities.length > 0">
                  <strong>สิ่งอำนวยความสะดวก:</strong>
                  <div class="facilities-tags">
                    <span v-for="facility in data.facilities" :key="facility" class="facility-tag">
                      {{ facility }}
                    </span>
                  </div>
                </div>
                <p class="last-updated" v-if="data.lastUpdated">
                  อัพเดทล่าสุด: {{ formatDate(data.lastUpdated) }}
                </p>
              </div>
            </div>
            
            <div v-if="Object.keys(floorData).length === 0" class="no-data">
              ยังไม่มีข้อมูลชั้น กรุณาเพิ่มข้อมูลใหม่
            </div>
          </div>
        </div>
      </div>

      <!-- Building Management Section -->
      <div class="building-management" v-show="buildingManageVisible">
        <h2>จัดการข้อมูลตึกคณะ</h2>
        
        <!-- Building List -->
        <div class="buildings-section" v-if="!selectedBuilding">
          <h3>เลือกตึกที่ต้องการจัดการ</h3>
          <div class="buildings-grid">
            <div 
              v-for="building in buildings" 
              :key="building.id"
              class="building-card"
              @click="selectBuilding(building)"
            >
              <div class="building-header">
                <h4>{{ building.name }}</h4>
                <span class="building-id">{{ building.id }}</span>
              </div>
              <div class="building-preview">
                <img v-if="building.imageUrl" :src="building.imageUrl" :alt="building.name" />
                <div v-else class="no-image">📷 ไม่มีรูปภาพ</div>
              </div>
              <div class="building-info">
                <p>{{ building.description || 'ไม่มีรายละเอียด' }}</p>
                <div class="facilities-count" v-if="building.facilities.length > 0">
                  🏢 สิ่งอำนวยความสะดวก {{ building.facilities.length }} รายการ
                </div>
              </div>
              <div class="building-actions">
                <button class="btn edit" @click.stop="editBuilding(building)">
                  ✏️ แก้ไข
                </button>
                <button class="btn view" @click.stop="viewBuildingModel(building.id)">
                  👁️ ดูโมเดล
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Building Edit Form -->
        <div class="building-form-section" v-if="selectedBuilding">
          <div class="form-header">
            <h3>{{ editingBuilding ? 'แก้ไขข้อมูลตึก' : 'ดูข้อมูลตึก' }} {{ selectedBuilding.name }}</h3>
            <button class="btn secondary" @click="cancelBuildingEdit">← กลับ</button>
          </div>
          
          <form @submit.prevent="saveBuildingData" class="building-form">
            <div class="form-group">
              <label>รหัสตึก:</label>
              <input v-model="buildingFormData.id" type="text" disabled />
            </div>

            <div class="form-group">
              <label>ชื่อตึก:</label>
              <input v-model="buildingFormData.name" type="text" :readonly="!editingBuilding" required />
            </div>

            <div class="form-group">
              <label>รายละเอียดตึก:</label>
              <textarea v-model="buildingFormData.description" :readonly="!editingBuilding" rows="4"></textarea>
            </div>

            <div class="form-group">
              <label>URL รูปภาพ:</label>
              <input v-model="buildingFormData.imageUrl" type="url" :readonly="!editingBuilding" />
              <div v-if="buildingFormData.imageUrl" class="image-preview">
                <img :src="buildingFormData.imageUrl" :alt="buildingFormData.name" />
              </div>
            </div>

            <div class="form-group">
              <label>URL โมเดล 3D:</label>
              <input v-model="buildingFormData.modelUrl" type="text" :readonly="!editingBuilding" />
            </div>

            <div class="form-group">
              <label>สิ่งอำนวยความสะดวก:</label>
              <div v-if="editingBuilding" class="facilities-input">
                <input 
                  v-model="newFacility" 
                  type="text" 
                  placeholder="เพิ่มสิ่งอำนวยความสะดวก" 
                  @keypress.enter.prevent="addBuildingFacility"
                />
                <button type="button" class="btn primary" @click="addBuildingFacility">เพิ่ม</button>
              </div>
              <div class="facilities-list">
                <span v-for="(facility, index) in buildingFormData.facilities" :key="index" class="facility-tag">
                  {{ facility }}
                  <button v-if="editingBuilding" type="button" class="btn-remove" @click="removeBuildingFacility(index)">×</button>
                </span>
              </div>
            </div>

            <div class="form-actions" v-if="editingBuilding">
              <button type="submit" class="btn primary" :disabled="saving">
                {{ saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
              </button>
              <button type="button" class="btn secondary" @click="cancelBuildingEdit">ยกเลิก</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, addDoc, doc, setDoc, deleteDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const router = useRouter();

const firebaseConfig = {
  apiKey: "AIzaSyAmfunEqGUmZHabiPKYwCuay3JCRVXa_DU",
  authDomain: "project-web-f9a73.firebaseapp.com",
  projectId: "project-web-f9a73",
  storageBucket: "project-web-f9a73.appspot.com",
  messagingSenderId: "809705005062",
  appId: "1:809705005062:web:f4736c194fc7cf68c5e387",
  measurementId: "G-BK760T9XCW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sidebar / Menu
const searchQuery = ref("");
const menuItems = [
  { name: "ตึกคณะ", label: "ตึกคณะ", icon: "🏛", submenu: ["SC01","SC08","SC09"] },
  { name: "รายชื่อผู้สมัคร", label: "รายชื่อผู้สมัคร", icon: "📋" }
];

const openSubmenus = ref([]);
function toggleSubmenu(name) {
  if (openSubmenus.value.includes(name)) {
    openSubmenus.value = openSubmenus.value.filter(n => n !== name);
  } else openSubmenus.value.push(name);
}

function filterList() {
  // ไม่ต้องทำอะไรเพราะ v-show จะ filter ด้วย computed later ถ้าต้องการ
}

// Canvas
const canvasVisible = ref(true);
const canvasContent = ref('<model-viewer src="../models/cp09model.glb" alt="3D model" auto-rotate camera-controls style="width:100%;height:100%;"></model-viewer>');

// Keep only essential variables

const formData = ref({
  floorId: '',
  description: '',
  facilities: []
});

function showCanvas(name) {
  // Reset all visibility
  canvasVisible.value = false;
  usersVisible.value = false;

  // Set visibility based on selected menu
  if (name === "รายชื่อผู้สมัคร") {
    usersVisible.value = true;
    showUsersTable();
  } else {
    // Show canvas for building models (SC01, SC08, SC09)
    canvasVisible.value = true;
    canvasContent.value = getCanvasContent(name);
  }

  if (sc09Visible.value) {
    loadFloorData();
  }

  console.log(`Showing canvas for: ${name}`);
}

// Canvas Content
function getCanvasContent(name) {
  const buildingModels = {
    'SC01': '/models/sc01.glb',
    'SC08': '/models/sc08.glb', 
    'SC09': '/models/sc09.glb',
    'ศูนย์อาหาร': '/models/food-center.glb',
    'ตู้ & เต่าบิน': '/models/vending.glb',
    'ที่จอดรถยนต์': '/models/car-parking.glb',
    'ที่จอดรถมอไซค์': '/models/motorcycle-parking.glb'
  };

  const modelUrl = buildingModels[name] || '/models/sc_all.glb';
  
  return `
    <div style="width:100%;height:100%;position:relative;">
      <model-viewer 
        src="${modelUrl}" 
        alt="3D model of ${name}" 
        auto-rotate 
        camera-controls 
        style="width:100%;height:100%;"
        loading="lazy"
        poster="/images/${name.toLowerCase()}-poster.jpg"
      ></model-viewer>
      <div style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.7);color:white;padding:8px 12px;border-radius:6px;font-size:14px;">
        📍 ${name}
      </div>
    </div>
  `;
}

// Settings
const settingsActive = ref(false);
function toggleSettingsMenu() { settingsActive.value = !settingsActive.value; }

// User info
const user = reactive({ fullName:'', faculty:'', major:'' });

// Admins & Users
const adminsVisible = ref(false);
const usersVisible = ref(false);
const admins = ref([]);
const users = ref([]);

async function showAdminsTable() {
  canvasVisible.value = false;
  usersVisible.value = false;
  adminsVisible.value = true;
  admins.value = [];
  const querySnapshot = await getDocs(collection(db,"admin"));
  querySnapshot.forEach(docSnap => admins.value.push({ id: docSnap.id, user: docSnap.data().user || '-' }));
}

async function updateAdmin(admin, e) {
  const refDoc = doc(db, "admin", admin.id);
  await updateDoc(refDoc, { user: e.target.innerText });
}

async function addAdmin() {
  await addDoc(collection(db,"admin"), { user:"ใหม่" });
  showAdminsTable();
}

async function showUsersTable() {
  canvasVisible.value = false;
  adminsVisible.value = false;
  usersVisible.value = true;
  users.value = [];
  const querySnapshot = await getDocs(collection(db,"users"));
  querySnapshot.forEach(docSnap => users.value.push({ id: docSnap.id, user: docSnap.data().user || '-' }));
}

async function updateUser(userItem, e) {
  const refDoc = doc(db,"users", userItem.id);
  await updateDoc(refDoc, { user: e.target.innerText });
}

async function addUser() {
  await addDoc(collection(db,"users"), { user:"ใหม่" });
  showUsersTable();
}

// Logout
function logoutUser() {
  // ล้างข้อมูลที่เก็บใน localStorage
  localStorage.clear();
  
  // แสดงข้อความแจ้งเตือน
  alert('ออกจากระบบสำเร็จ');
  
  // นำทางไปหน้า login
  router.push('/login');
}

// SC09 Management Functions
async function loadFloorData() {
  try {
    floorLoading.value = true;
    const descriptionsRef = collection(db, 'sc09_floor_descriptions');
    const snapshot = await getDocs(descriptionsRef);
    
    const data = {};
    snapshot.forEach((doc) => {
      const docData = doc.data();
      data[docData.floorId] = docData;
    });
    
    floorData.value = data;
    console.log('Loaded floor data:', data);
  } catch (error) {
    console.error('Error loading floor data:', error);
    alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
  } finally {
    floorLoading.value = false;
  }
}

async function saveFloorData() {
  if (!formData.value.floorId || !formData.value.description) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }

  try {
    saving.value = true;
    
    const docData = {
      floorId: parseInt(formData.value.floorId),
      description: formData.value.description,
      facilities: formData.value.facilities,
      lastUpdated: Timestamp.now()
    };

    const docRef = doc(db, 'sc09_floor_descriptions', `floor${formData.value.floorId}`);
    await setDoc(docRef, docData);
    
    console.log('Floor data saved:', docData);
    alert(editingFloor.value ? 'อัพเดทข้อมูลเรียบร้อย!' : 'บันทึกข้อมูลเรียบร้อย!');
    
    resetForm();
    await loadFloorData();
  } catch (error) {
    console.error('Error saving floor data:', error);
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  } finally {
    saving.value = false;
  }
}

function addFacility() {
  if (newFacility.value.trim()) {
    formData.value.facilities.push(newFacility.value.trim());
    newFacility.value = '';
  }
}

function removeFacility(index) {
  formData.value.facilities.splice(index, 1);
}

function editFloor(floorId) {
  const data = floorData.value[floorId];
  if (data) {
    editingFloor.value = floorId;
    formData.value = {
      floorId: data.floorId,
      description: data.description,
      facilities: [...(data.facilities || [])]
    };
  }
}

async function deleteFloor(floorId) {
  if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลชั้นนี้?')) {
    try {
      const docRef = doc(db, 'sc09_floor_descriptions', `floor${floorId}`);
      await deleteDoc(docRef);
      
      console.log('Floor data deleted:', floorId);
      alert('ลบข้อมูลเรียบร้อย!');
      
      await loadFloorData();
    } catch (error) {
      console.error('Error deleting floor data:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  }
}

function resetForm() {
  editingFloor.value = null;
  formData.value = {
    floorId: '',
    description: '',
    facilities: []
  };
  newFacility.value = '';
}

function getFloorName(floorId) {
  const floor = availableFloors.value.find(f => f.id == floorId);
  return floor ? `${floor.number} - ${floor.name}` : `ชั้น ${floorId}`;
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  return timestamp.toDate().toLocaleString('th-TH');
}

// Building Management Functions
async function loadBuildingsData() {
  buildingsLoading.value = true;
  try {
    // สำหรับตอนนี้ใช้ข้อมูล mock จนกว่าจะมี Firestore collection สำหรับ buildings
    const buildingsData = [
      { 
        id: 'SC01', 
        name: 'ตึก SC01', 
        description: 'ตึกคณะวิทยาศาสตร์ ชั้น 1-5 ห้องเรียนและห้องปฏิบัติการ',
        facilities: ['ห้องเรียน', 'ห้องปฏิบัติการ', 'ห้องน้ำ', 'ลิฟต์'],
        imageUrl: '',
        modelUrl: '/models/sc01.glb'
      },
      { 
        id: 'SC08', 
        name: 'ตึก SC08', 
        description: 'ตึกคณะวิทยาศาสตร์ ห้องสำนักงานและห้องประชุม',
        facilities: ['ห้องสำนักงาน', 'ห้องประชุม', 'ห้องน้ำ'],
        imageUrl: '',
        modelUrl: '/models/sc08.glb'
      },
      { 
        id: 'SC09', 
        name: 'ตึก SC09', 
        description: 'ตึกคณะวิทยาศาสตร์ ห้องปฏิบัติการขั้นสูงและห้องวิจัย',
        facilities: ['ห้องปฏิบัติการ', 'ห้องวิจัย', 'ห้องน้ำ', 'ลิฟต์'],
        imageUrl: '',
        modelUrl: '/models/sc09.glb'
      }
    ];
    buildings.value = buildingsData;
  } catch (error) {
    console.error('Error loading buildings data:', error);
  } finally {
    buildingsLoading.value = false;
  }
}

function selectBuilding(building) {
  selectedBuilding.value = building;
  buildingFormData.value = { ...building };
  editingBuilding.value = false;
}

function editBuilding(building) {
  selectedBuilding.value = building;
  buildingFormData.value = { ...building };
  editingBuilding.value = true;
}

function cancelBuildingEdit() {
  selectedBuilding.value = null;
  buildingFormData.value = {
    id: '',
    name: '',
    description: '',
    facilities: [],
    imageUrl: '',
    modelUrl: ''
  };
  editingBuilding.value = false;
}

function viewBuildingModel(buildingId) {
  // Switch to canvas view for the specific building
  showCanvas(buildingId);
}

async function saveBuildingData() {
  if (!editingBuilding.value) return;
  
  saving.value = true;
  try {
    // Update the building in the buildings array
    const index = buildings.value.findIndex(b => b.id === buildingFormData.value.id);
    if (index !== -1) {
      buildings.value[index] = { ...buildingFormData.value };
    }
    
    // Here you would save to Firestore when ready
    // await setDoc(doc(db, 'buildings', buildingFormData.value.id), buildingFormData.value);
    
    console.log('Building data saved:', buildingFormData.value);
    alert('บันทึกข้อมูลตึกสำเร็จ!');
    
    editingBuilding.value = false;
  } catch (error) {
    console.error('Error saving building data:', error);
    alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  } finally {
    saving.value = false;
  }
}

function addBuildingFacility() {
  if (newFacility.value.trim()) {
    buildingFormData.value.facilities.push(newFacility.value.trim());
    newFacility.value = '';
  }
}

function removeBuildingFacility(index) {
  buildingFormData.value.facilities.splice(index, 1);
}

// Load user info from localStorage
onMounted(async ()=>{
  user.fullName = localStorage.getItem("fullName")||"";
  user.faculty = localStorage.getItem("faculty")||"";
  user.major = localStorage.getItem("major")||"";
  
  // Import model-viewer for 3D model display
  try {
    const modelViewerModule = await import('https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js');
    console.log('Model Viewer loaded successfully');
  } catch (error) {
    console.log('Model Viewer loading failed, using fallback');
  }
});
</script>

<style scoped>
/* ย้าย CSS ของคุณมาทั้งหมด unchanged */
 /* ใส่ CSS ที่คุณมีทั้งหมดตรงนี้ */
</style>

<style scoped>
.container{
  --bg: #ffffff;
  --text: #0b1220; /* very dark */
  --muted: #6b7280;
  --surface: #ffffff;
  --accent: #0b84ff; /* bright blue */
  display:flex;
  min-height:100vh;
  background:var(--bg);
  color:var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}
.sidebar{
  width:260px;
  border-right:1px solid #eef2f7;
  padding:20px 16px;
  box-sizing:border-box;
  background: linear-gradient(180deg, #ffffff, #fbfdff);
}
.brand{ display:flex; align-items:center; gap:12px; margin-bottom:18px }
.brand .logo{ width:44px; height:44px; border-radius:10px; background:var(--text); color:white; display:flex; align-items:center; justify-content:center; font-weight:700 }
.brand .label{ font-weight:700; letter-spacing:0.6px }
.search-box{ display:flex; align-items:center; gap:8px; padding:8px; border-radius:8px; background:#f5f7fb; margin-bottom:14px }
.search-box input{ border:0; outline:none; background:transparent; width:100%; color:var(--text); font-size:14px }
.menu-list{ list-style:none; padding:0; margin:0 }
.menu-item{ display:flex; align-items:center; gap:10px; padding:10px 8px; border-radius:8px; cursor:pointer; color:var(--text); transition:background .15s, color .15s }
.menu-item:hover{ background:#f0f6ff }
.menu-item .icon{ font-size:18px }
.menu-item .label{ font-size:14px }
.submenu{ margin-top:6px; margin-left:34px; overflow:hidden; max-height:0; transition:max-height .25s ease }
.submenu.open{ max-height:200px }
.sub-item{ padding:6px 10px; border-radius:6px; color:var(--muted); font-size:13px; cursor:pointer }
.sub-item:hover{ background:#f0f6ff; color:var(--text) }

.main{ flex:1; padding:20px; position:relative }
.top-bar{ display:flex; align-items:center; justify-content:space-between; gap:12px; position:relative; padding:6px 40px 12px 0 }
.top-bar .title{ font-size:18px; font-weight:700 }

.logout-btn{ 
  background: #dc2626; 
  color: white; 
  border: none; 
  padding: 8px 16px; 
  border-radius: 6px; 
  cursor: pointer; 
  font-size: 14px; 
  font-weight: 500;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.logout-btn:hover{ 
  background: #b91c1c; 
}

.settings{ position:absolute; top:12px; right:18px; width:44px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:8px; cursor:pointer }
.settings svg{ width:22px; height:22px; fill:var(--muted) }
.settings:hover svg{ fill:var(--text) }
.settings-menu{ position:absolute; right:0; top:54px; background:var(--surface); border:1px solid #eef2f7; box-shadow:0 8px 20px rgba(11,18,32,0.06); min-width:220px; padding:12px; border-radius:8px; display:none }
.settings.active .settings-menu{ display:block }
.settings-menu .profile-info .name{ font-weight:700 }
.settings-menu .faculty-major{ font-size:13px; color:var(--muted); margin-top:4px }
.settings-menu .logout{ display:inline-block; margin-top:10px; color:var(--accent); text-decoration:none }

.canvas-area{ border-radius:8px; border:1px solid #eef4ff; padding:12px; min-height:420px; background: linear-gradient(180deg, #ffffff, #fbfdff) }

h3{ margin-top:14px; margin-bottom:8px }
table{ width:100%; border-collapse:collapse; margin-top:8px }
thead th{ text-align:left; padding:8px 10px; color:var(--muted); font-size:13px }
tbody td{ padding:10px; border-top:1px solid #f1f5f9 }

.btn{ display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:8px; border:1px solid transparent; cursor:pointer; margin-bottom:10px }
.btn.primary{ background:var(--accent); color:white }
.btn.ghost{ background:transparent; border-color:#eef2f7; color:var(--text) }

/* SC09 Management Styles */
.sc09-management {
  padding: 20px 0;
}

.form-section, .data-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.floor-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-group input, .form-group select, .form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none;
  border-color: #0b84ff;
  box-shadow: 0 0 0 2px rgba(11, 132, 255, 0.2);
}

.facilities-input {
  display: flex;
  gap: 8px;
}

.facilities-input input {
  flex: 1;
}

.facilities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.facility-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-remove {
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  font-weight: bold;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.floor-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.floor-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.floor-header {
  background: #f8f9fa;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.floor-header h4 {
  margin: 0;
  color: #1976d2;
}

.floor-actions {
  display: flex;
  gap: 8px;
}

.btn-delete {
  background: #f44336;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.floor-content {
  padding: 16px;
}

.floor-content p {
  margin: 8px 0;
  line-height: 1.5;
}

.facilities {
  margin: 12px 0;
}

.facilities-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.last-updated {
  font-size: 12px;
  color: #666;
  margin-top: 12px;
}

.loading, .no-data {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* Building Management Styles */
.building-management {
  padding: 20px 0;
}

.buildings-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.buildings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.building-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.building-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  border-color: #0b84ff;
}

.building-header {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.building-header h4 {
  margin: 0;
  color: #1976d2;
  font-size: 18px;
}

.building-id {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.building-preview {
  height: 120px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e5e7eb;
}

.building-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #999;
  font-size: 14px;
}

.building-info {
  padding: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.building-info p {
  margin: 0 0 10px 0;
  color: #666;
  line-height: 1.5;
}

.facilities-count {
  color: #1976d2;
  font-size: 14px;
  font-weight: 500;
}

.building-actions {
  padding: 12px 15px;
  display: flex;
  gap: 8px;
  background: #fafbfc;
}

.building-actions .btn {
  flex: 1;
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.edit {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.btn.edit:hover {
  background: #ffeaa7;
}

.btn.view {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.btn.view:hover {
  background: #bee5eb;
}

.building-form-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.form-header h3 {
  margin: 0;
  color: #333;
}

.building-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-preview {
  margin-top: 10px;
  max-width: 200px;
}

.image-preview img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}

/* responsive adjustments */
@media (max-width:800px){
  .sidebar{ display:none }
  .main{ padding:12px }
  .settings{ right:12px }
  
  .form-section, .data-section {
    padding: 15px;
  }
  
  .floor-form {
    gap: 15px;
  }
}
</style>
