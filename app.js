const express = require('express');
const mongoose = require('mongoose');
const serviceRoutes = require('./src/routes/serviceRoutes');
const dotenv = require("dotenv");

const app = express();
dotenv.config();
app.use(express.json());


app.use('/services', serviceRoutes);


async function start() {
  try {
    mongoose.connect(
      process.env.DB_CONNECT,
      { useNewUrlParser: true },
    );
    const port = process.env.PORT || 3009;
    app.listen(port, function (err) {
      if (err) console.log("Error in server setup");
      console.log("Server is Up and running");
    });
  } catch (e) {
    console.log("Server Error", e.message);
    process.exit(1);
  }
}
start();
