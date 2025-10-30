import FirestoreService from '../services/firestore.service.js';

/**
 * ดึงข้อมูล user ทั้งหมด
 * GET /api/v1/users
 */
export const getUsers = async (req, res) => {
  try {
    const users = await FirestoreService.getAll('users');
    
    // ลบรหัสผ่านออกจากผลลัพธ์ด้วยเหตุผลด้านความปลอดภัย
    const sanitizedUsers = users.map(user => {
      delete user.password;
      return user;
    });

    return res.status(200).json({
      success: true,
      message: 'ดึงข้อมูล user สำเร็จ',
      data: sanitizedUsers
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล user',
      error: error.message
    });
  }
};

/**
 * ดึงข้อมูล user ตาม ID
 * GET /api/v1/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID ของ user ไม่ระบุ'
      });
    }

    const user = await FirestoreService.getById('users', id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบ user นี้'
      });
    }

    // ลบรหัสผ่านออกจากผลลัพธ์ด้วยเหตุผลด้านความปลอดภัย
    delete user.password;

    return res.status(200).json({
      success: true,
      message: 'ดึงข้อมูล user สำเร็จ',
      data: user
    });
  } catch (error) {
    console.error('Get User By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล user',
      error: error.message
    });
  }
};

/**
 * สร้าง user ใหม่
 * POST /api/v1/users
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, faculty, major, year, studentId, favoriteThing, role = 'user' } = req.body;

    // ✅ ตรวจสอบฟิลด์ที่จำเป็น (ไม่ต้องมี email)
    if (!name || !password || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, รหัสผ่าน, รหัสนักศึกษา)'
      });
    }

    // ✅ ตรวจสอบรูปแบบรหัสนักศึกษา (XXXXXXXXX-X)
    const studentIdPattern = /^[0-9]{9}-[0-9]{1}$/;
    if (!studentIdPattern.test(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'รูปแบบรหัสนักศึกษาไม่ถูกต้อง (ต้องเป็น XXXXXXXXX-X)'
      });
    }

    // ✅ ตรวจสอบว่า studentId นี้มีในระบบแล้วหรือไม่
    const existingUsers = await FirestoreService.query('users', [
      { field: 'studentId', operator: '==', value: studentId }
    ]);

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'รหัสนักศึกษานี้ถูกใช้งานแล้ว'
      });
    }

    // ✅ บันทึกข้อมูลลงใน Firebase Firestore
    const userData = {
      name,
      password, // ⚠️ ควรเข้ารหัสรหัสผ่านในการใช้งานจริง
      faculty,
      major,
      year,
      studentId,
      favoriteThing,
      role,
      isActive: true,
      isVerified: false
    };

    // เพิ่ม email ถ้ามี
    if (email) {
      userData.email = email;
    }

    const newUser = await FirestoreService.create('users', userData);

    // ลบรหัสผ่านออก
    delete newUser.password;

    return res.status(201).json({
      success: true,
      message: 'สร้าง user สำเร็จ',
      data: newUser
    });
  } catch (error) {
    console.error('Create User Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้าง user',
      error: error.message
    });
  }
};

/**
 * อัปเดต user
 * PUT /api/v1/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID ของ user ไม่ระบุ'
      });
    }

    // ตรวจสอบว่า user มีอยู่หรือไม่
    const existingUser = await FirestoreService.getById('users', id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบ user นี้'
      });
    }

    // ✅ อัปเดตข้อมูล
    const updatedUser = await FirestoreService.update('users', id, updateData);

    // ลบรหัสผ่านออก
    delete updatedUser.password;

    return res.status(200).json({
      success: true,
      message: 'อัปเดต user สำเร็จ',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update User Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดต user',
      error: error.message
    });
  }
};

/**
 * ลบ user
 * DELETE /api/v1/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID ของ user ไม่ระบุ'
      });
    }

    // ตรวจสอบว่า user มีอยู่หรือไม่
    const existingUser = await FirestoreService.getById('users', id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบ user นี้'
      });
    }

    // ✅ ลบ user
    await FirestoreService.delete('users', id);

    return res.status(200).json({
      success: true,
      message: 'ลบ user สำเร็จ'
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    return res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบ user',
      error: error.message
    });
  }
};
