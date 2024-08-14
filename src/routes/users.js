const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middleware/auth0');


router.post('/', userController.createUser);
router.get('/:username', authenticateJWT, userController.getUserByUsername);
router.put('/:username', authenticateJWT, userController.updateUser);
router.delete('/:username', authenticateJWT, userController.deleteUser);

module.exports = router;