const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    start:{
        type: Number,
        default: 100000
    },
    balance:{
        type: Number,
        default: 100000
    },
    unrelprofit:{
        type: Number,
        default: 0
    },
    relprofit:{
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('User',userSchema)