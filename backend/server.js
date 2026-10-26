const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to MyCloud API!",
    status: "running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "MyCloud backend is working!",
  });
});
app.get("/api/files", (req, res) => {
  res.json([
    { name: "My Documents", type: "Folder", size: "—", icon: "📁" },
    { name: "Photos", type: "Folder", size: "—", icon: "📁" },
    { name: "Welcome.pdf", type: "PDF", size: "2.4 MB", icon: "📄" },
    { name: "My Notes.docx", type: "Document", size: "850 KB", icon: "📝" },
  ]);
});
const server = app.listen(PORT, () => {
  console.log(`MyCloud backend running at http://localhost:${PORT}`);
});

server.ref();