import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";

// PINs configuration - Added 'user' role
const PINS = {
  admin: process.env.ADMIN_PIN || "1122",
  accountant: process.env.ACCOUNTANT_PIN || "3344",
  store: process.env.STORE_PIN || "5566",
  user: process.env.USER_PIN || "7788" // Naya role aur PIN
};

router.post("/login", (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: "PIN required" });

  let userRole = null;
  if (String(pin) === String(PINS.admin)) userRole = "admin";
  else if (String(pin) === String(PINS.accountant)) userRole = "accountant";
  else if (String(pin) === String(PINS.store)) userRole = "store";
  else if (String(pin) === String(PINS.user)) userRole = "user"; // Check for user role

  if (!userRole) return res.status(401).json({ error: "Invalid PIN" });

  const token = jwt.sign({ role: userRole }, JWT_SECRET, { expiresIn: "12h" });
  res.json({ token, role: userRole });
});

export default router;