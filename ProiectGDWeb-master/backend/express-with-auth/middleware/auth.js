const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email, role, name }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function requirePacient(req, res, next) {
  if (!req.user || req.user.role !== "pacient") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

function requireDoctor(req, res, next) {
  if (!req.user || req.user.role !== "doctor") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}



module.exports = { requireAuth, requirePacient, requireDoctor, requireAdmin };


