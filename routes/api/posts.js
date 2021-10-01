const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')
const Post = require('../../modles/Posts')
const Profile = require('../../modles/Profile')
const Users = require('../../modles/Users')


//@route        POST API/Post
//@desc         create a psot
//@access       Public
router.post('/', [
        auth,[
            check('text', 'Text field is required').not().isEmpty()

        ]
    ] , async(req, res) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() })
        }

        try {
            const user = await Users.findById(req.user.id).select('-password')
            const newPost = new Post ({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            })
            const post = await newPost.save()
            res.json(post)
        } catch (err) {
            console.error(err.message)
            req.status(500).send('server error')
        }

})

//@route        GET API/Post
//@desc         Get all posts
//@access       Public

router.get('/', auth, async(req, res) =>{
    try {
        const posts = await Post.find().sort({ date: -1 })
        res.json(posts)
    } catch (err) {
        console.error(err.message)
        req.status(500).send('server error')
    }
})

//@route        GET API/Post
//@desc         Get all posts
//@access       Public

router.get('/:id', auth, async(req, res) =>{
    try {
        const posts = await Post.findById(req.params.id)
        if(!posts){
            return res.status(404).json({ msg: 'Post not found' })
        }
        res.json(posts)
    } catch (err) {
        console.error(err.message)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'Post not found' })
        }
        req.status(500).send('server error')
    }
})

//@route        GET API/Post
//@desc         Get all posts
//@access       Private

router.delete('/:id', auth, async(req, res) =>{
    try {
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({ msg: 'Post not found' })
        }
        if(post.user.toString() !== req.user.id){
            return res.send(404).json({ msg: 'User is not authenticated' })
        }
        await post.remove()

        res.json({
             msg: 'Post removed'
        })
    } catch (err) {
        console.error(err.message)
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg: 'Post not found' })
        }
        req.status(500).send('server error')
    }
})

//@route        Put API/Post/like/:id
//@desc         Put Likes 
//@access       Private

router.put('/like/:id', auth, async(req, res) =>{
    try {
        const post = await Post.findById(req.params.id)

        if(post.likes.filter(like => like.user.toString() === req.user.id).length>0){
            return res.status(400).json({ msg: 'Post already liked' })
        }
        post.likes.unshift({ user: req.user.id })
        await post.save()
        res.json(post.likes)
    } catch (err) {
        res.status(500).send('server error')
    }
})

//@route        Put API/Post/unlike/:id
//@desc         Put unike 
//@access       Private

router.put('/unlike/:id', auth, async(req, res) =>{
    try {
        const post = await Post.findById(req.params.id)

        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({ msg: 'Post not liked yer' })
        }
        // get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)
        post.likes.splice(removeIndex, 1)
        await post.save()
        res.json(post.likes)
    } catch (err) {
        res.status(500).send('server error')
    }
})

//@route        POST API/Post/comment/:id
//@desc         create a post comment
//@access       private
router.post('/comment/:id', [
    auth,[
        check('text', 'Comment field is required').not().isEmpty()

    ]
] , async(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const user = await Users.findById(req.user.id).select('-password')
        const post = await Post.findById(req.params.id)

        const newComment =  ({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })
        post.comment.unshift(newComment)
        await post.save()
        res.json(post.comment)
    } catch (err) {
        console.error(err.message)
        req.status(500).send('server error')
    }

})


//@route        POST API/Post/comment/:id
//@desc         create a post comment
//@access       private

router.delete('/comment/:id/:comment_id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        // pull out the comment
        const comments = post.comment.find(
            comments => comments.id === req.params.comment_id
        )

        // make sure comment exist
        
        if(!comments){
            return res.status(400).json({ msg: 'Comment does not exist' })
        }
        //check user
        if(comments.user.toString() !== req.user.id){
            return res.status(400).json({ msg: "User not authorized" })
        }
        const removeIndex = post.comment.map(comments => comments.user.toString()).indexOf(req.user.id)
        post.comment.splice(removeIndex, 1)
        await post.save()
        res.json(post.comments)
    } catch (err) {
        console.error(err.message)
        req.status(500).send('server error')
    }
})


module.exports = router;