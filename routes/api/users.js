const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const User = require('../../modles/Users')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

//@route        Post API/User
//@desc         Registration
//@access       Public
router.post(
  '/',
  [
    check('name', 'Enter Full name*').not().isEmpty(),
    check('email', 'Enter Email*').isEmail(),
    check('password', 'Enter Password (atleast 6 characters)*').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body

    try {
      // see if user exixts
      let user = await User.findOne({ email })
      if (user) {
        res.status(400).json({ errors: [{ msg: 'User already exists' }] })
      }
      //get users gravatar

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      })

      user = new User({
        name,
        email,
        avatar,
        password,
      })
      //encrypt password

      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)
      await user.save()

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
