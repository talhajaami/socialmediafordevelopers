const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')

const connectDB = async () => {
    try{
       await mongoose.connect(db, {
           useNewUrlParser: true,
        //    useCreateIndex: true
       })
       console.log('DB Connected...')
    } catch(err){
        console.error(err.message)
        //exit
        process.exit()
    }
}

module.exports = connectDB