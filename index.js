const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = "mysecretkey";

// Ambil data user dari file
function getUserData() {
  const raw = fs.readFileSync("users.json");
  return JSON.parse(raw); // harus array
}

// Simpan data user ke file
function saveUserData(users) {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
}

// LOGIN
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  const users = getUserData(); // perbaikan: ganti 'user' jadi 'users'

  const foundUser = users.find(
    (u) => u.username === username && u.password === password
  );

  if (foundUser) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "60m" });
    return res.json({ accessToken: token });
  }

  res.status(400).json({ message: "Invalid credentials" });
});

// GANTI PASSWORD 
app.post("/auth/change-password", (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  const users = getUserData(); // harus 'users'

  const userIndex = users.findIndex(
    (u) => u.username === username && u.password === oldPassword
  );

  if (userIndex === -1) {
    return res.status(400).json({ message: "Username atau password lama salah" });
  }

  users[userIndex].password = newPassword;
  saveUserData(users);

  res.json({ message: "Password updated" });
});

// UPDATE USER
app.put("/user/update", (req, res) => {
  const { username, email } = req.body;
  const users = getUserData();

  const userIndex = users.findIndex((u) => u.username === username);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User tidak ditemukan" });
  }

  users[userIndex].email = email;
  saveUserData(users);

  res.json({ message: "User updated" });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
