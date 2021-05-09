const { model, Schema } = require("mongoose");

// Schema for user documents in MongoDB
const projectSchema = new Schema({
  projectName: String,
  createdAt: String,
  owner: Schema.Types.ObjectId,
  users: [Schema.Types.ObjectId],
});

module.exports = model("Project", projectSchema);
