const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) return console.log("Mongo URI not provided".red.underline)
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
};

module.exports = connectDB;
