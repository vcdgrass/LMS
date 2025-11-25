const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Cấu hình nơi lưu file tạm
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir); // Tạo thư mục nếu chưa có
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Đặt tên file unique để tránh trùng: timestamp-tên-gốc
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Chỉ chấp nhận file CSV
const fileFilter = (req, file, cb) => {
    if (file.mimetype.includes('csv') || file.originalname.endsWith('.csv')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file định dạng .csv'), false);
    }
};

const uploadCsv = multer({ 
    storage: storage, 
    fileFilter: fileFilter 
});

module.exports = { uploadCsv };