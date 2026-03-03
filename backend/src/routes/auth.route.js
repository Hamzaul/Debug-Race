const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authenticateUser = require("../middleware/authenticateUser.middleware")

// // Guest login - NO authentication required
// router.post('/guest', (req, res) => {
//   try {
//     const { username } = req.body || {};
    
//     const guestUser = {
//       _id: `guest_${Date.now()}`,
//       username: username || `Player_${Math.floor(Math.random() * 10000)}`,
//       avatar: `avatar${Math.floor(Math.random() * 4) + 1}`,
//       isGuest: true,
//       stats: {
//         totalRaces: 0,
//         wins: 0,
//         totalQuestions: 0,
//         correctAnswers: 0
//       }
//     };
    
//     // Generate simple token
//     const token = `guest_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
//     console.log('✅ Guest login:', guestUser.username);
    
//     res.json({
//       ...guestUser,
//       token: token
//     });
//   } catch (error) {
//     console.error('❌ Guest login error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

/**
 *- /api/auth/register
 *- Post register Router
 */
router.post("/register", authController.registerController );

/**
 *- /api/auth/login
 *- Post login Router
 */
router.post("/login",authController.loginController);

/**
 *- /api/auth/login
 *- Post login Router
 */
router.get("/profile", authenticateUser,authController.getProfileController);

module.exports = router;