import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const adminCode = "0000";
const uploadsDir = path.join(__dirname, "uploads");

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDir));

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.post("/upload", upload.single("file"), (req, res) => {
  const providedCode = req.body?.adminCode;
  if (providedCode !== adminCode) {
    return res.status(403).json({ message: "Invalid admin code." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const isAllowed =
    req.file.mimetype.startsWith("image/") ||
    req.file.mimetype.startsWith("video/");

  if (!isAllowed) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Only images or videos allowed." });
  }

  return res.status(200).json({
    message: "Upload successful.",
    filePath: `/uploads/${req.file.filename}`,
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
