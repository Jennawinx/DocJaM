const { UserInputError } = require("apollo-server");

const ActiveFile = require("../../dbModels/ActiveFile");
const ActiveProject = require("../../dbModels/ActiveProject");

const Project = require("../../dbModels/Project");
const File = require("../../dbModels/File");
const User = require("../../dbModels/User");

module.exports = {
  connectToProject: async ({ projectId, peerId }) => {
    const project = await Project.findOne({ _id: projectId });
    if (!project) throw new UserInputError("Project does not exist!");

    // Get active peers
    let activePeers = await ActiveProject.find({ projectId: projectId }).sort({
      _id: -1,
    });

    // Add user to project
    await new ActiveProject({
      projectId: projectId,
      peerId: peerId,
    }).save();

    return activePeers;
  },
  /**
   * Any user from the peer2peer network can untrack a peer from the cache
   */
  disconnectPeerFromProject: async ({ projectId, peerId }) => {
    const project = await Project.findOne({ _id: projectId });
    if (!project) throw new UserInputError("Project does not exist!");

    return (
      (await ActiveProject.deleteMany({
        projectId: projectId,
        peerId: peerId,
      })) !== null
    );
  },
  connectToProjectFile: async ({ projectId, fileName, peerId }) => {
    const file = await File.findOne({
      projectId: projectId,
      fileName: fileName,
    });
    if (!file) throw new UserInputError("File does not exist!");

    // Get active peers
    let activePeers = await ActiveFile.find({
      projectId: projectId,
      fileName: fileName,
    }).sort({ _id: -1 });

    // Add user to active projectFile list
    await new ActiveFile({
      projectId: projectId,
      fileName: fileName,
      peerId: peerId,
    }).save();

    return activePeers;
  },
  /**
   * Any user from the peer2peer network can untrack a peer from the cache
   */
  disconnectPeerFromProjectFile: async ({ projectId, fileName, peerId }) => {
    const file = await File.findOne({
      projectId: projectId,
      fileName: fileName,
    });
    if (!file) throw new UserInputError("File does not exist!");

    return (
      (await ActiveFile.deleteMany({
        projectId: projectId,
        fileName: fileName,
        peerId: peerId,
      })) !== null
    );
  },
};
