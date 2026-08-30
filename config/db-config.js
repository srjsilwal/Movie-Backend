const mongoose = require('mongoose')


const dbConnection = async () => {
    try {
        const connection = await mongoose
          .connect(process.env.MONGODB_URI)
        console.log('Db connected successfully')
    } catch (error) {
        console.log('Error occurs while connecting the database',error)
    }
}

module.exports = {
    dbConnection
}

