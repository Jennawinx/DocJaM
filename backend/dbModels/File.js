const { model, Schema } = require("mongoose");

// Schema for user documents in MongoDB
const fileSchema = new Schema({
  fileName: String,
  data: String,
  projectId: { type: Schema.Types.ObjectId, ref: "projects" },
  createdAt: String,
});

module.exports = model("File", fileSchema);
