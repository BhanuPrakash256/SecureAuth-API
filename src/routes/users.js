const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authAccess = require('../middleware/authenticate_AccessToken');


router.post('/', userController.createUser);
router.get('/:username', authAccess, userController.getUserByUsername);
router.put('/:username', authAccess, userController.updateUser);
router.delete('/:username', authAccess, userController.deleteUser);

module.exports = router;