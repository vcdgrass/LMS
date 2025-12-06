const multer = require('multer');
const fs = require('fs');
const path = require('path');

// --- Cấu hình chung cho Storage ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Tạo thư mục uploads/assignments nếu chưa có
        const dir = 'uploads/assignments/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Tên file: timestamp-originalName
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

// --- Filter cho CSV (Code cũ) ---
const csvFilter = (req, file, cb) => {
    if (file.mimetype.includes('csv') || file.originalname.endsWith('.csv')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file định dạng .csv'), false);
    }
};

// --- [MỚI] Filter cho Bài tập (Assignment) ---
const assignmentFilter = (req, file, cb) => {
    // Cho phép: PDF, Word, Excel, Zip, Images, Text
    const allowedTypes = /pdf|doc|docx|xls|xlsx|zip|rar|png|jpg|jpeg|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
        cb(null, true);
    } else {
        cb(new Error('Định dạng file không được hỗ trợ.'), false);
    }
};

const uploadCsv = multer({ storage: storage, fileFilter: csvFilter });
// Export thêm uploadAssignment
const uploadAssignment = multer({ storage: storage, fileFilter: assignmentFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // Limit 10MB

module.exports = { uploadCsv, uploadAssignment };