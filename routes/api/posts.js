const express = require('express')
const router = express.Router()

//@route        GET API/Post
//@desc         Test route
//@access       Public
router.get('/', (req, res) => res.send('Post Route'))
module.exports = router;