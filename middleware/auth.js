import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";

export function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    
    // YAHAN LOGIC LAGAYEIN:
    const path = req.path; // e.g., /api/state
    const method = req.method;
    const role = req.user.role.toLowerCase();

    // 1. Agar Store user hai aur wo /api/state (poora data) mang raha hai
    // Toh usay ijazat deni hogi, warna 403 aayega.
    if (role === "store") {
        // Store ko sirf GET ki ijazat dein, PUT (delete/change) ki nahi
        if (method === "PUT" && path === "/api/state") {
            return res.status(403).json({ error: "Store cannot modify main state" });
        }
    }

    // 2. Accountant ko sab ijazat honi chahiye siwaye settings ke
    if (role === "accountant" && path.includes("settings")) {
        return res.status(403).json({ error: "Accountant cannot access settings" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}