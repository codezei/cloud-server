const express = require('express')
const mongoose = require('mongoose')
const config = require('config')
const authRouter = require('./routes/auth.routes')
const fileRouter = require('./routes/file.routes')
const corsMiddleware = require('./middleware/cors.middleware')
// const filePathMiddleware = require('./middleware/filePath.middleware')
const fileUpload = require('express-fileupload')
const path = require('path')


const app = express()
const PORT = process.env.PORT || config.get('serverPort')

app.use(corsMiddleware)
// app.use(filePathMiddleware(path.resolve(__dirname, 'files')))
app.use(express.json())
app.use(express.static('static'))
app.use(fileUpload({}))
app.use('/api/auth', authRouter)
app.use('/api/files', fileRouter)



const start = ()=>{
    try {
        mongoose.connect(config.get('dbUrl'))
        app.listen(PORT, ()=>{
            console.log(`Server started in port ${PORT}`)
        })
    } catch (e) {

    }
}


start()