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
      </div>

      <div class="canvas-area" v-show="canvasVisible">
        <div v-html="canvasContent"></div>
      </div>

      <div v-show="usersVisible" class="users-section">
        <div class="section-header">
          <h3>รายชื่อผู้สมัครทั้งหมด</h3>
          <div class="users-count" v-if="users.length > 0">
            📊 ทั้งหมด {{ users.length }} คน
          </div>
          <button class="btn primary" @click="showUsersTable" style="margin-left: 10px;">
            🔄 รีโหลดข้อมูล
          </button>
        </div>
        
        <div v-if="usersLoading" class="loading">
          <div class="loading-spinner"></div>
          <p>กำลังโหลดข้อมูลผู้สมัคร...</p>
        </div>
        
        <div v-else-if="users.length === 0" class="no-users">
          <div class="empty-state">
            <div class="empty-icon">👥</div>
            <h4>ยังไม่มีผู้สมัครในระบบ</h4>
            <p>เมื่อมีผู้ใช้สมัครสมาชิก ข้อมูลจะแสดงที่นี่</p>
          </div>
        </div>
        
        <div v-else class="users-grid">
          <div v-for="userItem in users" :key="userItem.id" class="user-card">
            <div class="user-avatar">
              <div class="avatar-placeholder">
                {{ getInitials(userItem.fullName || userItem.studentId || 'U') }}
              </div>
            </div>
            <div class="user-info">
              <div class="user-id-primary">{{ userItem.studentId || userItem.user || 'ไม่ระบุรหัส' }}</div>
              <h4 class="user-name">{{ userItem.fullName || 'ไม่ระบุชื่อ' }}</h4>
              <p class="user-faculty" v-if="userItem.faculty">🏛️ {{ userItem.faculty }}</p>
              <p class="user-major" v-if="userItem.major">📚 {{ userItem.major }}</p>
            </div>
            <div class="user-actions">
              <button class="btn-action edit" @click="editUser(userItem)" title="แก้ไข">
                ✏️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- User Detail Modal -->
      <div v-if="userDetailVisible" class="modal-overlay" @click="closeUserDetail">
        <div class="modal-content user-detail-modal" @click.stop>
          <div class="modal-header">
            <h3>รายละเอียดผู้ใช้</h3>
            <button class="btn-close" @click="closeUserDetail">×</button>
          </div>
          
          <div class="user-detail-content" v-if="selectedUser">
            <div class="user-detail-avatar">
              <div class="avatar-large">
                {{ getInitials(selectedUser.name || selectedUser.studentId || 'U') }}
              </div>
            </div>
            
            <div class="user-detail-info">
              <div class="info-grid">                
                <div class="info-item">
                  <label>ชื่อ-นามสกุล:</label>
                  <span class="info-value primary">{{ selectedUser.name || 'ไม่ระบุ' }}</span>
                </div>
                
                <div class="info-item">
                  <label>คณะ:</label>
                  <span class="info-value">{{ selectedUser.faculty || 'ไม่ระบุ' }}</span>
                </div>
                
                <div class="info-item">
                  <label>สาขา:</label>
                  <span class="info-value">{{ selectedUser.major || 'ไม่ระบุ' }}</span>
                </div>
                
                <div class="info-item" v-if="selectedUser.createdAt">
                  <label>วันที่สมัคร:</label>
                  <span class="info-value">{{ formatDate(selectedUser.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn primary" @click="openUserEdit">✏️ แก้ไขข้อมูล</button>
            <button class="btn danger" @click="confirmDeleteUser">🗑️ ลบผู้ใช้</button>
            <button class="btn secondary" @click="closeUserDetail">ปิด</button>
          </div>
        </div>
      </div>

      <!-- User Edit Modal -->
      <div v-if="userEditVisible" class="modal-overlay" @click="closeUserEdit">
        <div class="modal-content user-edit-modal" @click.stop>
          <div class="modal-header">
            <h3>แก้ไขข้อมูลผู้ใช้</h3>
            <button class="btn-close" @click="closeUserEdit">×</button>
          </div>
          
          <form @submit.prevent="saveUserData" class="user-edit-form">
            <div class="form-grid">
              <div class="form-group">
                <label>ชื่อ-นามสกุล *</label>
                <input 
                  v-model="editUserForm.name" 
                  type="text" 
                  required 
                  placeholder="ชื่อ นามสกุล"
                />
              </div>
              
              <div class="form-group">
                <label>คณะ *</label>
                <select v-model="editUserForm.faculty" required>
                  <option value="">เลือกคณะ</option>
                  <option value="คณะวิทยาศาสตร์">คณะวิทยาศาสตร์</option>
                  <option value="คณะวิศวกรรมศาสตร์">คณะวิศวกรรมศาสตร์</option>
                  <option value="คณะแพทยศาสตร์">คณะแพทยศาสตร์</option>
                  <option value="คณะครุศาสตร์">คณะครุศาสตร์</option>
                  <option value="คณะเกษตรศาสตร์">คณะเกษตรศาสตร์</option>
                  <option value="คณะบริหารธุรกิจ">คณะบริหารธุรกิจ</option>
                  <option value="คณะมนุษยศาสตร์">คณะมนุษยศาสตร์</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>สาขา *</label>
                <input 
                  v-model="editUserForm.major" 
                  type="text" 
                  required 
                  placeholder="สาขาวิชา"
                />
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="submit" class="btn primary" :disabled="saving">
                {{ saving ? '🔄 กำลังบันทึก...' : '💾 บันทึกข้อมูล' }}
              </button>
              <button type="button" class="btn secondary" @click="closeUserEdit">ยกเลิก</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Building Edit Modal -->
      <div v-if="buildingEditVisible" class="modal-overlay" @click="closeBuildingEdit">
        <div class="modal-content building-edit-modal" @click.stop>
          <div class="modal-header">
            <h3>แก้ไขข้อมูล{{ selectedBuilding.name }}</h3>
            <button class="btn-close" @click="closeBuildingEdit">×</button>
          </div>
          
          <form @submit.prevent="saveBuildingData" class="building-edit-form">
            <div class="building-info">
              <div class="building-icon">🏢</div>
              <h4>{{ selectedBuilding.name }}</h4>
              <p class="building-code">{{ selectedBuilding.code }}</p>
            </div>

            <div class="floors-section">
              <h5>ข้อมูลชั้นทั้งหมด</h5>
              <div class="floors-grid">
                <div v-for="(floor, index) in editBuildingForm.floors" :key="index" class="floor-item">
                  <div class="floor-header">
                    <span class="floor-number">ชั้น {{ floor.number }}</span>
                    <div class="floor-actions">
                      <button type="button" class="btn-toggle" @click="toggleFloorView(index)" :title="floor.isExpanded ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียด'">
                        {{ floor.isExpanded ? '👁️‍🗨️' : '👁️' }}
                      </button>
                      <button type="button" class="btn-remove" @click="removeFloor(index)" title="ลบชั้น">🗑️</button>
                    </div>
                  </div>

                  <!-- Floor Display View -->
                  <div v-if="!floor.isExpanded" class="floor-display">
                    <div class="floor-info-grid">
                      <div class="info-section">
                        <h6>🏷️ ชื่อชั้น</h6>
                        <p class="display-value">{{ floor.name || 'ไม่ระบุ' }}</p>
                      </div>
                      
                      <div class="info-section">
                        <h6>📝 คำอธิบาย</h6>
                        <p class="display-value description">{{ floor.description || 'ไม่มีคำอธิบาย' }}</p>
                      </div>
                      
                      <div class="info-section">
                        <h6>🏢 สิ่งอำนวยความสะดวก</h6>
                        <p class="display-value">{{ floor.facilities || 'ไม่ระบุ' }}</p>
                      </div>
                    </div>
                    
                    <div class="floor-actions-bar">
                      <button type="button" class="btn-edit" @click="toggleFloorView(index)">
                        ✏️ แก้ไข
                      </button>
                    </div>
                  </div>

                  <!-- Floor Edit Form -->
                  <div v-else class="floor-form">
                    <div class="form-group">
                      <label>ชื่อชั้น</label>
                      <input 
                        v-model="floor.name" 
                        type="text" 
                        placeholder="เช่น ชั้น 1, ชั้นล่าง"
                      />
                    </div>
                    
                    <div class="form-group">
                      <label>คำอธิบาย</label>
                      <textarea 
                        v-model="floor.description" 
                        rows="4"
                        placeholder="อธิบายรายละเอียดของชั้นนี้..."
                      ></textarea>
                    </div>
                    
                    <div class="form-group">
                      <label>สิ่งอำนวยความสะดวก</label>
                      <input 
                        v-model="floor.facilities" 
                        type="text" 
                        placeholder="เช่น ห้องน้ำ, ลิฟต์, บันได"
                      />
                    </div>
                    
                    <div class="form-actions">
                      <button type="button" class="btn-save" @click="toggleFloorView(index)">
                        💾 บันทึก
                      </button>
                      <button type="button" class="btn-cancel" @click="cancelFloorEdit(index)">
                        ❌ ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" class="btn secondary" @click="addFloor">
                ➕ เพิ่มชั้นใหม่
              </button>
            </div>
            
            <div class="modal-actions">
              <button type="submit" class="btn primary" :disabled="savingBuilding">
                {{ savingBuilding ? '🔄 กำลังบันทึก...' : '💾 บันทึกข้อมูลตึก' }}
              </button>
              <button type="button" class="btn secondary" @click="closeBuildingEdit">ยกเลิก</button>
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
import { getFirestore, collection, getDocs, updateDoc, addDoc, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const router = useRouter();

const firebaseConfig = {
  apiKey: "AIzaSyAmfunEqGUmZHabiPKYwCuay3JCRVXa_DU", // ใช้ชั่วคราว ต้องหาค่าจริงของ sci-map-eb9f8
  authDomain: "sci-map-eb9f8.firebaseapp.com",
  projectId: "sci-map-eb9f8",
  storageBucket: "sci-map-eb9f8.appspot.com",
  messagingSenderId: "809705005062", // ใช้ชั่วคราว
  appId: "1:809705005062:web:f4736c194fc7cf68c5e387", // ใช้ชั่วคราว
  measurementId: "G-BK760T9XCW" // ใช้ชั่วคราว
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
  // Filter functionality if needed
}

// Canvas
const canvasVisible = ref(true);
const canvasContent = ref('<model-viewer src="/models/sc_all.glb" alt="3D model" auto-rotate camera-controls style="width:100%;height:100%;"></model-viewer>');

// Canvas Content
function getCanvasContent(name) {
  const buildingModels = {
    'SC01': '/models/sc01.glb',
    'SC08': '/models/sc08.glb', 
    'SC09': '/models/sc09.glb'
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
      ></model-viewer>
      <div style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.7);color:white;padding:8px 12px;border-radius:6px;font-size:14px;">
        📍 ${name}
      </div>
    </div>
  `;
}

function showCanvas(name) {
  // Reset all visibility
  canvasVisible.value = false;
  usersVisible.value = false;

  // Set visibility based on selected menu
  if (name === "รายชื่อผู้สมัคร") {
    usersVisible.value = true;
    showUsersTable();
  } else if (['SC01', 'SC08', 'SC09'].includes(name)) {
    // Open building edit modal for building codes
    openBuildingEdit(name);
  } else {
    // Show canvas for other items
    canvasVisible.value = true;
    canvasContent.value = getCanvasContent(name);
  }

  console.log(`Showing canvas for: ${name}`);
}

// User info
const user = reactive({ fullName:'', faculty:'', major:'' });

// Users
const usersVisible = ref(false);
const users = ref([]);
const usersLoading = ref(false);

// User Detail & Edit
const selectedUser = ref(null);
const userDetailVisible = ref(false);
const userEditVisible = ref(false);
const saving = ref(false);
const editUserForm = ref({
  name: '',
  faculty: '',
  major: ''
});

// Building Edit
const selectedBuilding = ref(null);
const buildingEditVisible = ref(false);
const savingBuilding = ref(false);
const editBuildingForm = ref({
  floors: []
});

async function showUsersTable() {
  usersLoading.value = true;
  try {
    console.log('Loading users from Firestore...');
    
    // ดึงข้อมูลจาก collection 'users' ตามที่เห็นใน Firestore
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    
    console.log(`Found ${usersSnapshot.docs.length} documents in 'users' collection`);
    
    const userData = usersSnapshot.docs
      .map(doc => {
        const data = doc.data();
        console.log('Document data:', doc.id, data);
        
        return {
          id: doc.id,
          collection: 'users',
          studentId: data.studentId || data.user || doc.id, // ใช้ studentId หรือ user หรือ doc id
          fullName: data.name || data.fullName || '', // ใช้ name หรือ fullName
          faculty: data.faculty || '',
          major: data.major || '',
          email: data.email || '',
          phone: data.phone || '',
          createdAt: data.createdAt || null,
          role: data.role || '',
          ...data // เก็บข้อมูลเดิมไว้ด้วย
        };
      })
      .filter(user => user.role === 'user'); // แสดงเฉพาะผู้ใช้ที่มี role เป็น "user"
    
    // เรียงลำดับตามรหัสนักศึกษา
    users.value = userData.sort((a, b) => {
      const idA = a.studentId || '';
      const idB = b.studentId || '';
      return idA.localeCompare(idB);
    });
    
    console.log(`Processed ${users.value.length} users:`, users.value);
  } catch (error) {
    console.error("Error loading users:", error);
    users.value = [];
  } finally {
    usersLoading.value = false;
  }
}

// Helper function to get initials from name
function getInitials(name) {
  if (!name) return 'U';
  const words = name.split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
}

function viewUserDetails(userItem) {
  selectedUser.value = userItem;
  userDetailVisible.value = true;
}

function editUser(userItem) {
  selectedUser.value = userItem;
  openUserEdit();
}

async function updateUserName(userItem, newName) {
  try {
    const userDoc = doc(db, userItem.collection || 'users', userItem.id);
    await updateDoc(userDoc, { 
      fullName: newName,
      user: newName // update both fields for compatibility
    });
    
    // Update local data
    userItem.fullName = newName;
    userItem.user = newName;
    
    console.log('User updated successfully');
  } catch (error) {
    console.error("Error updating user:", error);
    alert('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
  }
}

// User Detail & Edit Functions
function closeUserDetail() {
  userDetailVisible.value = false;
  selectedUser.value = null;
}

function openUserEdit() {
  if (selectedUser.value) {
    editUserForm.value = {
      name: selectedUser.value.name || selectedUser.value.fullName || '',
      faculty: selectedUser.value.faculty || '',
      major: selectedUser.value.major || ''
    };
    userDetailVisible.value = false;
    userEditVisible.value = true;
  }
}

function closeUserEdit() {
  userEditVisible.value = false;
  editUserForm.value = {
    name: '',
    faculty: '',
    major: ''
  };
}

async function saveUserData() {
  if (!selectedUser.value) return;
  
  saving.value = true;
  try {
    const userDoc = doc(db, 'users', selectedUser.value.id);
    const updateData = {
      name: editUserForm.value.name,
      faculty: editUserForm.value.faculty,
      major: editUserForm.value.major,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(userDoc, updateData);
    
    // Update local data
    Object.assign(selectedUser.value, updateData);
    
    // Update users list
    const userIndex = users.value.findIndex(u => u.id === selectedUser.value.id);
    if (userIndex !== -1) {
      Object.assign(users.value[userIndex], updateData);
    }
    
    alert('✅ บันทึกข้อมูลสำเร็จ!');
    closeUserEdit();
    
  } catch (error) {
    console.error("Error updating user:", error);
    alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  } finally {
    saving.value = false;
  }
}

async function confirmDeleteUser() {
  if (!selectedUser.value) return;
  
  const userName = selectedUser.value.name || selectedUser.value.studentId || 'ผู้ใช้';
  const confirmed = confirm(`คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "${userName}"?\n\nการกระทำนี้ไม่สามารถยกเลิกได้!`);
  
  if (confirmed) {
    try {
      const userDoc = doc(db, 'users', selectedUser.value.id);
      await deleteDoc(userDoc);
      
      // Remove from local list
      users.value = users.value.filter(u => u.id !== selectedUser.value.id);
      
      alert('✅ ลบผู้ใช้สำเร็จ!');
      closeUserDetail();
      
    } catch (error) {
      console.error("Error deleting user:", error);
      alert('❌ เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  }
}

function formatDate(dateValue) {
  if (!dateValue) return 'ไม่ระบุ';
  
  try {
    let date;
    if (dateValue.toDate) {
      // Firestore Timestamp
      date = dateValue.toDate();
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else {
      date = dateValue;
    }
    
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'ไม่ระบุ';
  }
}

// Building Edit Functions
async function openBuildingEdit(buildingCode) {
  const buildingNames = {
    'SC01': 'ตึกวิทยาศาสตร์ 1',
    'SC08': 'ตึกวิทยาศาสตร์ 8', 
    'SC09': 'ตึกวิทยาศาสตร์ 9'
  };

  selectedBuilding.value = {
    code: buildingCode,
    name: buildingNames[buildingCode] || buildingCode
  };

  // โหลดข้อมูลตึกจาก Firebase
  await loadBuildingData(buildingCode);
  buildingEditVisible.value = true;
}

function closeBuildingEdit() {
  buildingEditVisible.value = false;
  selectedBuilding.value = null;
  editBuildingForm.value = { floors: [] };
}

async function loadBuildingData(buildingCode) {
  try {
    const buildingDoc = doc(db, 'buildings', buildingCode);
    const buildingSnapshot = await getDoc(buildingDoc);
    
    if (buildingSnapshot.exists()) {
      const data = buildingSnapshot.data();
      const floors = data.floors || getDefaultFloors();
      // เพิ่ม isExpanded สำหรับควบคุมการแสดง/ซ่อน
      floors.forEach(floor => {
        floor.isExpanded = false; // เริ่มต้นแสดงแบบ display view
        floor.originalData = { ...floor }; // เก็บข้อมูลเดิมไว้สำหรับยกเลิก
      });
      editBuildingForm.value = { floors };
    } else {
      // ถ้าไม่มีข้อมูล ให้สร้างข้อมูลเริ่มต้น
      const floors = getDefaultFloors();
      floors.forEach(floor => {
        floor.isExpanded = false;
        floor.originalData = { ...floor };
      });
      editBuildingForm.value = { floors };
    }
  } catch (error) {
    console.error('Error loading building data:', error);
    const floors = getDefaultFloors();
    floors.forEach(floor => {
      floor.isExpanded = false;
      floor.originalData = { ...floor };
    });
    editBuildingForm.value = { floors };
  }
}

function getDefaultFloors() {
  return [
    { number: 1, name: 'ชั้น 1', description: '', facilities: '' },
    { number: 2, name: 'ชั้น 2', description: '', facilities: '' },
    { number: 3, name: 'ชั้น 3', description: '', facilities: '' },
    { number: 4, name: 'ชั้น 4', description: '', facilities: '' }
  ];
}

function toggleFloorView(index) {
  const floor = editBuildingForm.value.floors[index];
  if (floor.isExpanded) {
    // เมื่อบันทึก: อัพเดทข้อมูลเดิม
    floor.originalData = { ...floor };
  } else {
    // เมื่อเริ่มแก้ไข: เก็บข้อมูลปัจจุบันไว้
    floor.originalData = { ...floor };
  }
  floor.isExpanded = !floor.isExpanded;
}

function cancelFloorEdit(index) {
  const floor = editBuildingForm.value.floors[index];
  // คืนค่าข้อมูลเดิม
  Object.assign(floor, floor.originalData);
  floor.isExpanded = false;
}

function addFloor() {
  const newFloorNumber = editBuildingForm.value.floors.length + 1;
  const newFloor = {
    number: newFloorNumber,
    name: `ชั้น ${newFloorNumber}`,
    description: '',
    facilities: '',
    isExpanded: true // เริ่มต้นในโหมดแก้ไขสำหรับชั้นใหม่
  };
  newFloor.originalData = { ...newFloor };
  editBuildingForm.value.floors.push(newFloor);
}

function removeFloor(index) {
  if (editBuildingForm.value.floors.length > 1) {
    editBuildingForm.value.floors.splice(index, 1);
    // อัพเดทหมายเลขชั้นใหม่
    editBuildingForm.value.floors.forEach((floor, idx) => {
      floor.number = idx + 1;
      if (!floor.name || floor.name.startsWith('ชั้น ')) {
        floor.name = `ชั้น ${idx + 1}`;
      }
      floor.originalData = { ...floor };
    });
  }
}

async function saveBuildingData() {
  if (!selectedBuilding.value) return;
  
  savingBuilding.value = true;
  try {
    const buildingDoc = doc(db, 'buildings', selectedBuilding.value.code);
    const updateData = {
      code: selectedBuilding.value.code,
      name: selectedBuilding.value.name,
      floors: editBuildingForm.value.floors,
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(buildingDoc, updateData, { merge: true });
    
    alert('✅ บันทึกข้อมูลตึกสำเร็จ!');
    closeBuildingEdit();
    
  } catch (error) {
    console.error("Error updating building:", error);
    alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูลตึก');
  } finally {
    savingBuilding.value = false;
  }
}

// Logout
function logoutUser() {
  localStorage.clear();
  router.push('/login');
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
  
  // Test Firestore connection
  console.log('Firebase app initialized:', app);
  console.log('Firestore db initialized:', db);
});
</script>

<style scoped>
* { box-sizing: border-box; }
.container {
  --bg: #f5f5f7;
  --text: #0b1220;
  --muted: #6b7280;
  --surface: #ffffff;
  --accent: #0b84ff;
  display:flex;
  min-height:100vh;
  background:var(--bg);
  color:var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}

.sidebar{
  width:280px;
  background:var(--surface);
  border-right:1px solid #ddd;
  padding:20px;
  box-shadow:0 4px 20px rgba(0,0,0,.08);
}

.brand{
  display:flex;
  align-items:center;
  gap:12px;
  margin-bottom:30px;
}

.brand .logo{
  width:44px;
  height:44px;
  background:linear-gradient(145deg, var(--accent), #0056b3);
  color:#fff;
  border-radius:12px;
  display:grid;
  place-items:center;
  font-weight:900;
  font-size:22px;
}

.brand .label{
  font-weight:700;
  font-size:18px;
}

.search-box{
  display:flex;
  align-items:center;
  gap:10px;
  background:#f1f4f9;
  padding:12px 14px;
  border-radius:12px;
  margin-bottom:24px;
  border:1px solid #e1e5e9;
}

.search-box input{
  flex:1;
  border:none;
  outline:none;
  background:transparent;
  color:var(--text);
}

.menu-list{
  list-style:none;
  margin:0;
  padding:0;
}

.menu-item{
  display:flex;
  align-items:center;
  gap:12px;
  padding:14px 16px;
  border-radius:12px;
  cursor:pointer;
  margin:8px 0;
  color:var(--muted);
  font-weight:500;
  transition:all .2s ease;
}

.menu-item:hover{
  background:#f1f4f9;
  color:var(--text);
}

.menu-item .icon{
  font-size:20px;
}

.submenu{
  display:none;
  flex-direction:column;
  gap:4px;
  margin-left:44px;
  margin-top:8px;
}

.submenu.open{
  display:flex;
}

.sub-item{
  padding:8px 12px;
  border-radius:8px;
  cursor:pointer;
  color:var(--muted);
  transition:all .2s ease;
}

.sub-item:hover{
  background:#e8f2ff;
  color:var(--accent);
}

.main{
  flex:1;
  min-width:0;
  padding:20px;
  display:flex;
  flex-direction:column;
}

.top-bar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:0 0 20px 0;
  border-bottom:1px solid #e1e5e9;
  margin-bottom:20px;
}

.title{
  font-size:28px;
  font-weight:800;
  color:var(--text);
}

.logout-btn{
  background:linear-gradient(145deg, #ff4757, #ff3742);
  color:#fff;
  border:none;
  padding:10px 20px;
  border-radius:8px;
  cursor:pointer;
  font-weight:600;
  transition:all .2s ease;
}

.logout-btn:hover{
  transform:translateY(-2px);
  box-shadow:0 8px 25px rgba(255,71,87,.3);
}

.canvas-area{
  flex:1;
  background:var(--surface);
  border-radius:12px;
  border:2px dashed #ddd;
  min-height:400px;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
}

.btn{
  padding:10px 16px;
  border:none;
  border-radius:8px;
  cursor:pointer;
  font-weight:600;
  transition:all .2s ease;
}

.btn.primary{
  background:var(--accent);
  color:#fff;
}

.btn.primary:hover{
  background:#0056b3;
  transform:translateY(-1px);
}

table{
  width:100%;
  border-collapse:collapse;
  background:var(--surface);
  border-radius:12px;
  overflow:hidden;
  box-shadow:0 4px 20px rgba(0,0,0,.08);
}

table th, table td{
  padding:12px 16px;
  text-align:left;
  border-bottom:1px solid #e1e5e9;
}

table th{
  background:#f8f9fa;
  font-weight:600;
  color:var(--text);
}

table td[contenteditable]:hover{
  background:#f1f4f9;
}

/* Users Section Styles */
.users-section {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e1e5e9;
}

.section-header h3 {
  margin: 0;
  color: var(--text);
  font-size: 24px;
  font-weight: 700;
}

.users-count {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1976d2;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e3f2fd;
  border-top: 4px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-users {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.empty-state {
  text-align: center;
  color: var(--muted);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-state h4 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: var(--text);
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.user-card {
  background: var(--surface);
  border: 1px solid #e1e5e9;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
  border-color: var(--accent);
}

.user-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent), #00b7ff);
}

.user-avatar {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #00b7ff);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
}

.user-info {
  text-align: center;
  margin-bottom: 15px;
}

.user-id-primary {
  background: linear-gradient(135deg, var(--accent), #00b7ff);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  font-family: monospace;
  margin-bottom: 8px;
  display: inline-block;
  letter-spacing: 0.5px;
}

.user-name {
  margin: 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.user-info p {
  margin: 4px 0;
  font-size: 14px;
  color: var(--muted);
  line-height: 1.4;
}







.user-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.btn-action {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.btn-action:hover {
  transform: translateY(-2px);
}

.btn-action.view {
  color: #1976d2;
}

.btn-action.view:hover {
  background: #e3f2fd;
}

.btn-action.edit {
  color: #f57c00;
}

.btn-action.edit:hover {
  background: #fff3e0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px 16px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: var(--text);
  font-size: 20px;
  font-weight: 700;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--muted);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: #f3f4f6;
  color: var(--text);
}

/* User Detail Modal */
.user-detail-modal {
  width: 500px;
}

.user-detail-content {
  padding: 25px;
}

.user-detail-avatar {
  text-align: center;
  margin-bottom: 25px;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #00b7ff);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
}

.info-grid {
  display: grid;
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-size: 14px;
  font-weight: 600;
  color: var(--muted);
}

.info-value {
  font-size: 16px;
  color: var(--text);
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.info-value.primary {
  background: linear-gradient(135deg, var(--accent), #00b7ff);
  color: white;
  font-weight: 600;
  font-family: monospace;
  letter-spacing: 0.5px;
}

/* User Edit Modal */
.user-edit-modal {
  width: 600px;
}

.user-edit-form {
  padding: 25px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(11, 132, 255, 0.1);
}

.form-group input:invalid {
  border-color: #ef4444;
}

.modal-actions {
  padding: 20px 25px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  background: #f8f9fa;
  border-radius: 0 0 16px 16px;
}

.btn.danger {
  background: #ef4444;
  color: white;
}

.btn.danger:hover {
  background: #dc2626;
}

.btn.secondary {
  background: #f3f4f6;
  color: var(--text);
  border: 1px solid #e5e7eb;
}

.btn.secondary:hover {
  background: #e5e7eb;
}

/* Building Edit Modal */
.building-edit-modal {
  width: 90vw;
  max-width: 800px;
  max-height: 90vh;
}

.building-info {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 25px;
}

.building-info .building-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.building-info h4 {
  font-size: 1.5rem;
  margin: 10px 0 5px 0;
}

.building-info .building-code {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

.floors-section h5 {
  color: var(--text);
  margin-bottom: 20px;
  font-size: 1.1rem;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
}

.floors-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.floor-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.floor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
}

.floor-number {
  font-weight: 600;
  color: var(--primary);
  font-size: 1.1rem;
}

.floor-actions {
  display: flex;
  gap: 8px;
}

.btn-toggle {
  background: #eff6ff;
  color: #2563eb;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-toggle:hover {
  background: #dbeafe;
}

.btn-remove {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #fecaca;
}

/* Floor Display View */
.floor-display {
  padding: 15px 0;
}

.floor-info-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
}

.info-section h6 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.display-value {
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin: 0;
  font-size: 0.9rem;
  color: #475569;
  min-height: 45px;
  display: flex;
  align-items: center;
}

.display-value.description {
  min-height: 80px;
  align-items: flex-start;
  line-height: 1.5;
  white-space: pre-wrap;
}

.display-value:empty::before {
  content: "ไม่มีข้อมูล";
  color: #9ca3af;
  font-style: italic;
}

.floor-actions-bar {
  display: flex;
  justify-content: center;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.btn-edit {
  background: #f0f9ff;
  color: #0369a1;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-edit:hover {
  background: #e0f2fe;
}

/* Floor Edit Form */

.floor-form {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 15px;
  align-items: start;
}

.floor-form .form-group {
  margin-bottom: 0;
}

.floor-form label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 5px;
}

.floor-form input,
.floor-form textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.floor-form input:focus,
.floor-form textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.floor-form textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 10px;
  justify-content: center;
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
  margin-top: 15px;
}

.btn-save {
  background: #dcfce7;
  color: #166534;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #bbf7d0;
}

.btn-cancel {
  background: #fef2f2;
  color: #991b1b;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #fee2e2;
}

/* responsive adjustments */
@media (max-width:800px){
  .sidebar{ display:none }
  .main{ padding:12px }
  
  .user-detail-modal, .user-edit-modal, .building-edit-modal {
    width: 95vw;
    max-width: none;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .floor-form {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .floor-info-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .floor-actions {
    flex-wrap: wrap;
  }
  
  .modal-header {
    padding: 15px 20px;
  }
  
  .user-detail-content, .user-edit-form, .building-edit-form {
    padding: 20px;
  }
  
  .modal-actions {
    padding: 15px 20px;
    flex-wrap: wrap;
  }
  
  .modal-actions .btn {
    flex: 1;
    min-width: 120px;
  }
  
  .building-info {
    padding: 15px;
  }
  
  .floors-grid {
    gap: 15px;
  }
  
  .floor-item {
    padding: 15px;
  }
}
</style>