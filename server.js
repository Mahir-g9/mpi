const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;


const API_KEY = "mpi";

app.use(express.json());

app.use(express.static("."));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

let images = [];

function checkApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.post("/api/upload", checkApiKey, upload.single("img"), (req, res) => {
  const name = req.body.name || req.file.originalname;
  const img = { id: Date.now(), name, url: "/uploads/" + req.file.filename };
  images.push(img);
  res.json(img);
});

app.get("/api/images", checkApiKey, (req, res) => {
  res.json(images);
});

app.delete("/api/delete/:id", checkApiKey, (req, res) => {
  const id = parseInt(req.params.id);
  const img = images.find((x) => x.id === id);
  if (img) fs.unlinkSync(path.join("uploads", img.url.split("/").pop()));
  images = images.filter((x) => x.id !== id);
  res.json({ ok: true });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
