const mongoose = require('mongoose');

const connectToMongoDB = async () => {
    await mongoose.connect(process.env.MONGO_URI,
        { dbName: "whatshapp-clone" }
    ).then(data => {
        console.log("Connected to MongoDB");
    }).catch(err => {
        throw err;
    });
}

module.exports = { connectToMongoDB };