const { model, Schema } = require("mongoose");

// Schema for user documents in MongoDB
const userSchema = new Schema({
  username: String,
  firstname: String,
  lastname: String,
  password: String,
  email: String,
  createdAt: String,
});

module.exports = model("User", userSchema);
