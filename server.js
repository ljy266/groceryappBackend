//import npm package
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
require("dotenv").config();
const cors = require('cors');


const app = express()
const PORT = process.env.PORT 


const routes = require('./routes/api')

const MONGODBURL = 'mongodb+srv://ljy:RaqoeYxEOKje4CaL@cluster0.gsbwwci.mongodb.net/?retryWrites=true&w=majority'
//do not expose this database url in a real life scenario

mongoose.connect(process.env.MONGODB_URL || MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected!')
})

//Data parsing
app.use(express.json())
app.use(express.urlencoded({extended: false}))

//http request logger
app.use(morgan('tiny'))

// const corsOptions ={
//     origin:'http://localhost:3000', 
//     credentials:true,            //access-control-allow-credentials:true
//     optionSuccessStatus:200
// }
app.use(cors());

app.use('/api', routes)





app.listen(PORT, console.log(`Server is starting at ${PORT}`))