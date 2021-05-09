const { model, Schema } = require("mongoose");

// Schema for user documents in MongoDB
const activeFileSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "projects" },
  fileName: String,
  peerId: String,
});

module.exports = model("ActiveFile", activeFileSchema);
