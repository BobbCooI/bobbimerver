import express from 'express';
const router = express.Router();
import * as authService from './authControl';
// split up route handling
router.post('/login', authService.login);
router.post('/register', authService.register);
router.post('/userCheck', authService.userCheck);
router.post('/emailCheck', authService.emailCheck);
// etc.

export default router;