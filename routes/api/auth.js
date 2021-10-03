const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const User = require('../../modles/Users')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

//@route        GET API/Auth
//@desc         Test route
//@access       Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

//@route        Post API/Auth
//@desc         Authenticate User & get token
//@access       Public
router.post(
  '/',
  [
    check('email', 'Enter Valid Email*').isEmail(),
    check('password', 'Password is required*').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
      // see if user exixts
      let user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({
          errors: [{ msg: 'Invalid Email' }],
        })
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res.status(400).json({
          errors: [{ msg: 'Invalid Password' }],
        })
      }

      //return jsonwebtoken

      const payload = {
        user: {
          id: user.id,
        },
      }

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err
          res.json({ token })
        }
      )

      // res.send('User Registered')
    } catch (err) {
      console.error(err.message)
      res.status(500).send('server error')
    }
  }
)

module.exports = router
