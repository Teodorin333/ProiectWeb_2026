var admin = require("firebase-admin");

var serviceAccount = require("./proiect-tic-87381-firebase-adminsdk-fbsvc-6a363545a1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


async function getPacientOne(db) {
  try {
    const pacientOneRef = db.collection('pacienti').doc('pacient1');
    const pacientOne = await pacientOneRef.get(); 
    if (pacientOne.exists) {
   
      return pacientOne.data(); 
    } else {
      return null; 
    }
  } catch (error) {
    console.error('Error retrieving pacient1 data:', error);
    return null;
  }

}

module.exports = {
  db,
  getPacientOne
};