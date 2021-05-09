const File = require("../../dbModels/File");
const Project = require("../../dbModels/Project");
const { verifyFileInfo, verifyId } = require("../../utils/validation");
const { convertFile, convertFiles } = require("../../utils/conversion");

// Queries and mutations for files
module.exports = {
  async getFile({ fileId }) {
    // Check that the fileId is valid
    const { errors, isValid } = verifyId(fileId);
    if (!isValid) throw new Error(JSON.stringify(errors));

    // Check that the file exists
    const file = await File.findOne({ _id: fileId });

    if (!file) {
      throw new Error("File does not exist!");
    }

    return convertFile(file);
  },
  async getFiles({ projectId }) {
    // Check that the projectId is valid
    const { errors, isValid } = verifyId(projectId);
    if (!isValid) throw new Error(JSON.stringify(errors));

    // Check that the project exists
    const project = await Project.findOne({ _id: projectId });

    if (!project) {
      throw new Error("Project does not exist!");
    }

    // Get all the files that belong to the given project
    const files = await File.find({ projectId });

    return convertFiles(files);
  },

  async createFile({ projectId, fileName }, req) {
    // Verify that the given projectId is a valid object id
    // and that the filename is not empty
    const { errors, isValid } = verifyFileInfo(projectId, fileName);
    if (!isValid) throw new Error(JSON.stringify(errors));

    // Check authentication
    if (!req.isAuthenticated) {
      throw new Error("Unauthorized!");
    }

    // Check that project exists in the database
    const project = await Project.findOne({ _id: projectId });

    if (!project) {
      throw new Error("Project does not exist!");
    }

    // Check that a file with given name does not already exist in this project
    const file = await File.findOne({ fileName, projectId: project._id });

    if (file) {
      throw new Error("File with given name already exists in this project!");
    }

    // Create a new file with the data given in the arguments
    const newFile = new File({
      fileName,
      createdAt: new Date().toISOString(),
      projectId: project._id,
      data: "",
    });

    // Save the file and get the result
    const result = await newFile.save();

    return convertFile(result);
  },
  async deleteFile({ fileId }, req) {
    // Check that the fileId is valid
    const { errors, isValid } = verifyId(fileId);
    if (!isValid) throw new Error(JSON.stringify(errors));

    // Check authentication
    if (!req.isAuthenticated) {
      throw new Error("Unauthorized!");
    }

    // Check that the file exists
    const file = await File.findOne({ _id: fileId });

    if (!file) {
      throw new Error("File does not exist!");
    }

    let result = await File.deleteOne({ _id: fileId });

    // Return true if the file was deleted properly
    return result !== null;
  },
  async addFileData({ fileId, data }, req) {
    // Check that the fileId is valid
    const { errors, isValid } = verifyId(fileId);
    if (!isValid) throw new Error(JSON.stringify(errors));

    // Check authentication
    if (!req.isAuthenticated) {
      throw new Error("Unauthorized!");
    }

    // Check that the file exists
    const file = await File.findOne({ _id: fileId });

    if (!file) {
      throw new Error("File does not exist!");
    }

    // Set the files' data to the given data
    file.data = data;

    // Save the file and get the result
    const result = await file.save();

    return convertFile(result);
  },
};
