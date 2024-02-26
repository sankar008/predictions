const router = require('express').Router();
const {createUser , login, emailVerification, forgotPassword, resetPassword, resetOtp,  getUserById, updateUserById, deleteUser, changePassword} = require('./user.controller');

const { checkToken } = require("../../auth/jwt_token");

router.post('/signup', createUser);
router.post('/login', login);
router.patch("/email/verification", emailVerification)
router.patch("/forgot/password", forgotPassword);
router.patch("/reset/password", resetPassword);
router.patch("/reset/otp", resetOtp);
router.get("/", checkToken, getUserById);
router.patch("/", checkToken, updateUserById);
router.delete("/", checkToken, deleteUser);
router.patch("/change-password", checkToken, changePassword);

module.exports = router;