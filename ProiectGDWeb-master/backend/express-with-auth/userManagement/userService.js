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

const findByEmail = async (collectionName, email) => {
  const snap = await db.collection(collectionName).where("email", "==", email).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, data: doc.data() };
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
   
    const pacient = await findByEmail("pacienti", email);
    if (pacient) {
      const ok = await bcrypt.compare(password, pacient.data.passwordHash || "");
      if (!ok) return res.status(401).json({ error: "Unauthorized" });

      const token = jwt.sign(
        {
          id: pacient.id,
          email,
          role: "pacient",
          name: pacient.data.name || ""
        },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      return res.status(200).json({ token });
    }

   
    const doctor = await findByEmail("doctori", email);
    if (doctor) {
      const ok = password === (doctor.data.password || "");
      if (!ok) return res.status(401).json({ error: "Unauthorized" });

      const token = jwt.sign(
        {
          id: doctor.id,
          email,
          role: "doctor",
          name: doctor.data.nume || ""
        },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      return res.status(200).json({ token });
    }

   
    const admin = await findByEmail("admini", email);
    if (admin) {
      const ok = password === (admin.data.password || "");
      if (!ok) return res.status(401).json({ error: "Unauthorized" });

      const token = jwt.sign(
        {
          id: admin.id,
          email,
          role: "admin",
          name: admin.data.nume || ""
        },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      return res.status(200).json({ token });
    }

   
    return res.status(401).json({ error: "Unauthorized" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server error" });
  }
};


const getMe = async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role !== "pacient") {
      
      return res.status(403).json({ error: "Forbidden" });
    }

    const docRef = db.collection("pacienti").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) return res.status(404).json({ error: "User not found" });

    const data = snap.data();

      let studyName = "";
      let studyStarted = false;

      if (data.studyId) {
        const studySnap = await db.collection("studiu").doc(data.studyId).get();
        if (studySnap.exists) {
          const s = studySnap.data() || {};
          studyName = `${(s.afectiune || "").trim()} - ${(s.medicament || "").trim()}`.trim();
          studyStarted = !!s.started;
        }
      }


   
   return res.json({
  id,
  name: data.name || "",
  email: data.email || "",
  dateOfBirth: data.dateOfBirth || "",
  studyId: data.studyId || "",
  studyName,
  studyStarted,
  allergies: data.allergies || "",
  affectedGroup: !!data.affectedGroup,
  acceptedTerms: !!data.acceptedTerms,
});

  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
};

const updatePacientStudyInfo = async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role !== "pacient") return res.status(403).json({ error: "Forbidden" });

    const {
      dateOfBirth,
      studyId,
      allergies = "",
      affectedGroup,
      acceptedTerms,
    } = req.body;

    
    if (!dateOfBirth) return res.status(400).json({ error: "dateOfBirth is required" });
    if (!studyId) return res.status(400).json({ error: "studyId is required" });
    if (typeof affectedGroup !== "boolean") return res.status(400).json({ error: "affectedGroup must be boolean" });
    if (acceptedTerms !== true) return res.status(400).json({ error: "acceptedTerms must be true" });

    const docRef = db.collection("pacienti").doc(id);

    await docRef.update({
      dateOfBirth,        
      studyId,             
      allergies,           
      affectedGroup,       
      acceptedTerms,       
      updatedAt: new Date()
    });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
};



const getStudies = async (req, res) => {
  try {
    const snap = await db.collection("studiu").get();

    const studies = snap.docs
      .map((doc) => {
        const data = doc.data() || {};
        const afectiune = (data.afectiune || "").trim();
        const medicament = (data.medicament || "").trim();
        const descriere = (data.descriere || "").trim();

        return {
        id: doc.id,
        name: `${afectiune} - ${medicament}`.trim(),
        afectiune,
        medicament,
        descriere,
        started: !!data.started,
        startedAt: data.startedAt || null,
};

      })
      
      .sort((a, b) => {
        const m = (a.medicament || "").localeCompare(b.medicament || "");
        if (m !== 0) return m;
        return (a.afectiune || "").localeCompare(b.afectiune || "");
      });

    return res.status(200).json({ studies });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Nu pot încărca studiile." });
  }
};

const enrollInStudy = async (req, res) => {
  try {
    const { id, role } = req.user;
    if (role !== "pacient") return res.status(403).json({ error: "Forbidden" });

    const { studyId, force } = req.body;
    if (!studyId) return res.status(400).json({ error: "studyId is required" });

    const targetStudySnap = await db.collection("studiu").doc(studyId).get();
if (!targetStudySnap.exists) {
  return res.status(404).json({ error: "Study not found" });
}
const targetStudyData = targetStudySnap.data() || {};
const targetStudyStarted = !!targetStudyData.started;

const targetStudyName = `${(targetStudyData.afectiune || "").trim()} - ${(targetStudyData.medicament || "").trim()}`.trim();


if (targetStudyStarted) {
  return res.status(423).json({
    error: "study_started",
    studyId,
    studyName: targetStudyName
  });
}


    const pacientRef = db.collection("pacienti").doc(id);
    const pacientSnap = await pacientRef.get();
    if (!pacientSnap.exists) return res.status(404).json({ error: "User not found" });

    const pacientData = pacientSnap.data() || {};
    const currentStudyId = pacientData.studyId || "";

    
if (currentStudyId) {
  const currentStudySnap = await db.collection("studiu").doc(currentStudyId).get();
  if (currentStudySnap.exists) {
    const cs = currentStudySnap.data() || {};
    if (cs.started) {
      const currentName = `${(cs.afectiune || "").trim()} - ${(cs.medicament || "").trim()}`.trim();

      return res.status(423).json({
        error: "already_in_started_study",
        studyId: currentStudyId,
        studyName: currentName
      });
    }
  }
}


    
    if (currentStudyId && currentStudyId !== studyId && force !== true) {
      
      const currentStudySnap = await db.collection("studiu").doc(currentStudyId).get();
      const targetStudySnap = await db.collection("studiu").doc(studyId).get();

      const current = currentStudySnap.exists ? currentStudySnap.data() : {};
      const target = targetStudySnap.exists ? targetStudySnap.data() : {};

      const currentName = `${current?.afectiune || ""} - ${current?.medicament || ""}`.trim();
      const targetName = `${target?.afectiune || ""} - ${target?.medicament || ""}`.trim();

      return res.status(409).json({
        error: "already_enrolled",
        currentStudyId,
        currentStudyName: currentName,
        targetStudyId: studyId,
        targetStudyName: targetName,
      });
    }

    
    await pacientRef.update({
  studyId,
  placebo: false,          
  enrolledAt: new Date(),
  updatedAt: new Date(),
});


    
    const studySnap = await db.collection("studiu").doc(studyId).get();
    const s = studySnap.exists ? studySnap.data() : {};
    const studyName = `${s?.afectiune || ""} - ${s?.medicament || ""}`.trim();

    return res.json({ ok: true, studyId, studyName });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
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


const getStudiesForDoctor = async (req, res) => {
  try {
    const snap = await db.collection("studiu").get();

    const studies = snap.docs
      .map((doc) => {
        const data = doc.data() || {};
        const afectiune = (data.afectiune || "").trim();
        const medicament = (data.medicament || "").trim();
        const descriere = (data.descriere || "").trim();

        return {
          id: doc.id,
          afectiune,
          medicament,
          descriere,
          name: `${afectiune} - ${medicament}`.trim(),
          started: !!data.started,
          startedAt: data.startedAt || null,

        };
      })
      .sort((a, b) => (a.medicament || "").localeCompare(b.medicament || ""));

    return res.json({ studies });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Nu pot încărca studiile." });
  }
};


const getStudyParticipants = async (req, res) => {
  try {
    const { studyId } = req.params;

    const snap = await db
      .collection("pacienti")
      .where("studyId", "==", studyId)
      .get();

    const participants = snap.docs.map((doc) => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        name: data.name || "",
        email: data.email || "",
        placebo: !!data.placebo,
      };
    });

    return res.json({ participants });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Nu pot încărca participanții." });
  }
};


const setPacientPlacebo = async (req, res) => {
  try {
    const { pacientId } = req.params;
    const { placebo } = req.body;

    if (typeof placebo !== "boolean") {
      return res.status(400).json({ error: "placebo must be boolean" });
    }

    const ref = db.collection("pacienti").doc(pacientId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Pacient not found" });

    await ref.update({ placebo, updatedAt: new Date() });

    const pacient = snap.data() || {};
if (pacient.studyId) {
  const studySnap = await db.collection("studiu").doc(pacient.studyId).get();
  const s = studySnap.exists ? (studySnap.data() || {}) : {};
  if (s.started) {
    return res.status(423).json({ error: "study_started" });
  }
}


    return res.json({ ok: true, placebo });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Eroare la update placebo." });
  }
};


const removePacientFromStudy = async (req, res) => {
  try {
    const { pacientId } = req.params;

    const ref = db.collection("pacienti").doc(pacientId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Pacient not found" });

    const pacient = snap.data() || {};
if (pacient.studyId) {
  const studySnap = await db.collection("studiu").doc(pacient.studyId).get();
  const s = studySnap.exists ? (studySnap.data() || {}) : {};
  if (s.started) {
    return res.status(423).json({ error: "study_started" });
  }
}


    await ref.update({
      studyId: "",
      placebo: false,
      updatedAt: new Date(),
    });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Eroare la eliminare pacient." });
  }
};



const getStudiesForAdmin = async (req, res) => {
  return getStudies(req, res); 
};


const startStudy = async (req, res) => {
  try {
    const { studyId } = req.params;

    const ref = db.collection("studiu").doc(studyId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: "Study not found" });

    const data = snap.data() || {};
    if (data.started) {
      return res.status(409).json({ error: "already_started" });
    }

    await ref.update({
      started: true,
      startedAt: new Date(),
    });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
};


module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  checkEmailNotInUse,
  getMe,
  updatePacientStudyInfo,
  getStudies,
  enrollInStudy,

  // doctor
  getStudiesForDoctor,
  getStudyParticipants,
  setPacientPlacebo,
  removePacientFromStudy,

  // admin
getStudiesForAdmin,
startStudy

};

