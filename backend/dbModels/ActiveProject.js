const { model, Schema } = require("mongoose");

const activeProjectSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "projects" },
  peerId: String,
});

module.exports = model("ActiveProject", activeProjectSchema);
