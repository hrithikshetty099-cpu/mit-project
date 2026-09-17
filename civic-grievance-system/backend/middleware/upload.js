import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
fs.mkdirSync('uploads', { recursive: true });
const storage = multer.diskStorage({ destination: 'uploads/', filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '')}`) });
export const upload = multer({
	storage,
	limits: { fileSize: 50 * 1024 * 1024 },
	fileFilter: (_req, file, callback) => {
		if (file.fieldname === 'voice' && file.mimetype.startsWith('audio/')) return callback(null, true);
		if (file.fieldname === 'media' && (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/'))) return callback(null, true);
		callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
	}
});