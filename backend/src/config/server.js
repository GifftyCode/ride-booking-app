require("dotenv").config();

const connectDB = require("./db");
const { createApp } = require("./app");

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  createApp().listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
