const express = require("express");
const cors = require("cors");
require("dotenv").config();

// const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
// app.use(logger);

// routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/team", require("./routes/team"));
app.use("/api/race", require("./routes/race"));
app.use("/api/ai", require("./routes/ai"));

// 404
app.use((req,res)=>{
  res.status(404).json({error:`Cannot ${req.method} ${req.path}`})
});

app.use(errorHandler);

module.exports = app;