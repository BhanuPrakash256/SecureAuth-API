const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/', userController.createUser);
router.get('/:username', authenticateToken('access'), userController.getUserByUsername);
router.put('/:username', authenticateToken('access'), userController.updateUser);
router.delete('/:username', authenticateToken('access'), userController.deleteUser);

module.exports = router;