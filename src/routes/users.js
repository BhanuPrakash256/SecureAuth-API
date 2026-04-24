const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');
const { authLimiter } = require('../middleware/rateLimiter');
const idempotency = require('../middleware/idempotency');
const { createUserValidators } = require('../middleware/validators/userValidators');
const handleValidation = require('../middleware/validators/handleValidation');

router.post('/', authLimiter, idempotency, createUserValidators, handleValidation, userController.createUser);
router.get('/:username', authenticateToken('access'), userController.getUserByUsername);
router.put('/:username', authenticateToken('access'), userController.updateUser);
router.delete('/:username', authenticateToken('access'), userController.deleteUser);

module.exports = router;
