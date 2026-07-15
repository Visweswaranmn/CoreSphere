import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import multer from 'multer';

/** Absolute path to the directory where uploaded files are stored. */
export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

/** Multer instance: disk storage, 10 MB per file. */
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});
