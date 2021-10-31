const Router = require('express')
const User = require('../models/User')
const router = new Router()
const bcrypt = require('bcryptjs') 
const {check, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')
const authMiddleware = require('../middleware/auth.middleware')
const fileService = require('../services/fileService')
const File = require('../models/File')

router.post('/registration', [
    check('email', 'Uncorrect email').isEmail(),
    check('password', 'Password must be longer than 3 and shorter than 12').isLength({min: 3, max: 12})
], async (req, res)=>{
    try {

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({message: 'Uncorrect request', errors})
        }

        const {email, password} = req.body

        const candidate = await User.findOne({email})

        if (candidate) {
            return res.status(400).json({message: `User with email ${email} is already exist`})
        }

        let hashPassword = await bcrypt.hash(password, 10)

        const user = new User({email, password: hashPassword})

        await user.save()

        //после того как пользователь был сохранен вбазе данных создаем дл него отдельную папку название у которой будет id пользователя

        await fileService.createDir(req, new File({
            user: user.id,
            name: ""
        }))

        return res.json({message: 'User was created'})

    } catch (e) {
        res.send({message: 'Server error'})
    }
})

router.post('/login', async (req, res)=>{
    try {

        const {email, password} = req.body

        const user = await User.findOne({email})

        if (!user) {
            return res.status(404).json({message: `User not found`})
        }

        let isPassValid = await bcrypt.compare(password, user.password)

        if (!isPassValid) {
            return res.status(400).json({message: `Invalid password`})
        }

        const token = jwt.sign({id: user.id}, config.get('secretKey'), {expiresIn: '1h'})

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                diskSpace: user.diskSpace,
                usedSpace: user.usedSpace,
                avatar: user.avatar
            }
        })

    } catch (e) {
        res.send({message: 'Server error'})
    }
})

router.get('/auth', authMiddleware, async (req, res)=>{
    
    try {

        const user = await User.findOne({_id: req.user.id})

        const token = jwt.sign({id: user.id}, config.get('secretKey'), {expiresIn: '1h'})

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                diskSpace: user.diskSpace,
                usedSpace: user.usedSpace,
                avatar: user.avatar
            }
        })

    } catch (e) {
        res.send({message: 'Server error'})
    }
})


module.exports = router