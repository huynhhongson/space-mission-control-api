const mongoose = require('mongoose')

const planetSchema = mongoose.Schema({
    keplerName:{
        type: String,
        required: true,
    }
})

//Connects planetSchema with the "planets" collection
module.exports = mongoose.model('Planet', planetSchema)