const express = require('express')
const router = express.Router();
const userService = require('./userService')
const { userValidationRules, loginValidationRules } = require('../validators/userValidator')
const { validate } = require('../middleware/validate')
const { requireAuth, requirePacient, requireDoctor, requireAdmin } = require("../middleware/auth");




router.get('/users', userService.getAllUsers);
router.post('/users', userValidationRules(), validate, userService.registerUser);
router.post('/login', loginValidationRules(), validate, userService.loginUser);
router.get("/studies", userService.getStudies);

// logged-in pacient profile
router.get("/me", requireAuth, requirePacient, userService.getMe);

// update study participation info
router.put("/me/study", requireAuth, requirePacient, userService.updatePacientStudyInfo);

router.put("/me/enroll", requireAuth, requirePacient, userService.enrollInStudy);

// ✅ Doctor-only routes
router.get("/doctor/studies", requireAuth, requireDoctor, userService.getStudiesForDoctor);
router.get("/doctor/studies/:studyId/participants", requireAuth, requireDoctor, userService.getStudyParticipants);
router.put("/doctor/pacienti/:pacientId/placebo", requireAuth, requireDoctor, userService.setPacientPlacebo);
router.delete("/doctor/pacienti/:pacientId/study", requireAuth, requireDoctor, userService.removePacientFromStudy);

// ✅ Admin-only routes
router.get("/admin/studies", requireAuth, requireAdmin, userService.getStudiesForAdmin);
router.put("/admin/studies/:studyId/start", requireAuth, requireAdmin, userService.startStudy);


module.exports = router