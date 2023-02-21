const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
require('dotenv').config();

// Mongoose configuration
mongoose.set('strictQuery', true);

// Express app
const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));

// Mongoose connection 
mongoose.connect(process.env.MONGO_URI)
.then( () => {
    // Listen for requests
    let port = process.env.PORT;
    if(port==null || port==""){
      port=8000;
    };

    app.listen(port , () => {
        console.log(`Connected to the database & server running on port ${port}`);
    })
})
.catch((err) => {
    console.error(`Error connecting to the database. n${err}`);
});

//Mongoose models and Schemas
const Schema = mongoose.Schema;

const savedSchema = new Schema({
    value: Number,
    unit: String,
    valueConverted: Number,
    unitConverted: String
});

const Saved = mongoose.model('Saved', savedSchema);

// Routes
app.get('/saved-conversions', async (req, res) => {
    const saved =  await Saved.find({});
    res.status(200).json(saved);
});

app.post('/post-conversions', async (req, res) => {
    const {value, unit, valueConverted, unitConverted} = req.body;

    const entry = await Saved.create({value, unit, valueConverted, unitConverted});

    try {
        res.status(200).json(entry);
    }catch(error){
        res.status(400).json({error:error.message});
    }
});

app.delete('/delete-conversion', async (req, res) => {
    const {id} = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error:'Conversion does not exist'});
    }

    const conversion = await Saved.findOneAndDelete({_id: id});

    if(!conversion) {
        return res.status(404).json({error:'Conversion does not exist'})
    }

    res.status(200).json(conversion)
});

