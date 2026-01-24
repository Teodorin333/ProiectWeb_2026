const db = require('../db_config/dbInit')
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");




const getAllUsers = (req, res) => {
    res.send('you want to get all users')
} 

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await db
      .collection("pacienti")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!exists.empty) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    const ref = await db.collection("pacienti").add({
      name,
      email,
      passwordHash,
      createdAt: new Date(),
    });

    // ✅ create token immediately (auto-login after register)
    const token = jwt.sign(
      { id: ref.id, email, role: "pacient", name },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.status(201).json({ id: ref.id, name, email, token });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server error" });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const snap = await db.collection("pacienti").where("email", "==", email).limit(1).get();
    if (snap.empty) return res.status(401).json({ error: "Unauthorized" });

    const doc = snap.docs[0];
    const pacient = doc.data();

    const ok = await bcrypt.compare(password, pacient.passwordHash || "");
    if (!ok) return res.status(401).json({ error: "Unauthorized" });

    const token = jwt.sign(
        { id: doc.id, email, role: "pacient", name: pacient.name || "" },
        JWT_SECRET,
        { expiresIn: "2h" }
        );


    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server error" });
  }
};


const checkEmailNotInUse = async (email) => {
  try {
    const querySnapshot = await db
      .collection("pacienti")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      return Promise.reject("E-mail already in use");
    }

    return true;
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
};


module.exports = {
    getAllUsers,
    registerUser,
    loginUser,
    checkEmailNotInUse
}