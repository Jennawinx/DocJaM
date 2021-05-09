const mongoose = require("mongoose");
const {
  UserInputError,
  AuthenticationError,
  ApolloError,
} = require("apollo-server");

const Project = require("../../dbModels/Project");
const User = require("../../dbModels/User");
const { verifyProjectInfo, verifyId } = require("../../utils/validation");
const { convertProject, convertProjects } = require("../../utils/conversion");

// Queries and mutations on for projects and collaborators
module.exports = {
  getProjectCollaborators: async ({ projectId }) => {
    // Verify that the given project Id is valid
    const { errors, isValid } = verifyId(projectId);
    if (!isValid) throw new UserInputError("Invalid project id!", { errors });

    // Verify that the project with given id exists
    const project = await Project.findOne({ _id: projectId });

    if (!project) {
      throw new ApolloError("Project does not exist!", {
        errors: { project: "Project does not exist!" },
      });
    }

    // Add the project owner's id to allUsers
    let allUsers = project.users;

    // Convert the userIds to ObjectIds
    let userIds = allUsers.map((uid) => mongoose.Types.ObjectId(uid));

    // Get all the documents for the ids in userIds
    let result = await User.find({ _id: { $in: userIds } });

    return result;
  },
  getNonCollaborators: async ({ projectId }) => {
    // Verify that the given project Id is valid
    const { errors, isValid } = verifyId(projectId);
    if (!isValid) throw new UserInputError("Invalid project id!", { errors });

    // Verify that the project with given id exists
    const project = await Project.findOne({ _id: projectId });

    if (!project) {
      throw new ApolloError("Project does not exist!", {
        errors: { project: "Project does not exist!" },
      });
    }

    // Add the project owner's id to allUsers
    let allUsers = project.users;
    allUsers.push(project.owner);

    // Get all the users that are not already collaborating with this project
    let result = await User.find({ _id: { $nin: allUsers } });

    return result;
  },
  getProject: async ({ projectId }) => {
    // Verify that the given project Id is valid
    const { errors, isValid } = verifyId(projectId);
    if (!isValid) throw new UserInputError("Invalid project id!", { errors });

    // Verify that the project with given id exists
    const project = await Project.findOne({ _id: projectId });

    if (!project) {
      throw new ApolloError("Project does not exist!", {
        errors: { project: "Project does not exist!" },
      });
    }

    return convertProject(project);
  },
  getAllProjects: async ({ username }) => {
    // Check that a user with given username exists in the database
    const user = await User.findOne({ username });

    if (!user) {
      throw new UserInputError("Username does not exist!", {
        errors: { username: "Username does not exist!" },
      });
    }

    // Get all the projects that are this user owns or has access to
    const allProjects = await Project.find({
      $or: [{ owner: user._id }, { users: user._id }],
    });

    return convertProjects(allProjects);
  },
  getOwnProjects: async (args, req) => {
    // Check authentication and Get the user id
    if (!req.isAuthenticated) {
      throw new AuthenticationError("Unauthorized!", {
        errors: { authentication: "Unauthorized!" },
      });
    }
    const userId = req.id;

    // Get all the projects that are this user owns or has access to
    const allProjects = await Project.find({ owner: userId });

    return convertProjects(allProjects);
  },
  getSharedProjects: async (args, req) => {
    // Check authentication and Get the user id
    if (!req.isAuthenticated) {
      throw new AuthenticationError("Unauthorized!", {
        errors: { authentication: "Unauthorized!" },
      });
    }
    const userId = req.id;

    // Get all the projects that are this user owns or has access to
    const allProjects = await Project.find({ users: userId });

    return convertProjects(allProjects);
  },

  createProject: async ({ projectName }, req) => {
    // Check authentication and Get the user id
    if (!req.isAuthenticated) {
      throw new AuthenticationError("Unauthorized!", {
        errors: { authentication: "Unauthorized!" },
      });
    }
    const userId = req.id;

    // Verify that the given project Name and username are not empty
    const { errors, isValid } = verifyProjectInfo(projectName);

    if (!isValid) throw new UserInputError("Invalid project name!", { errors });

    // Check that a user with given username exists in the database
    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AuthenticationError("User does not exist!", {
        errors: { authentication: "User does not exist!" },
      });
    }

    // Check that the given user does not already have a project with given name
    const project = await Project.findOne({ projectName, owner: user.id });

    if (project) {
      throw new UserInputError(
        "You already have a project with the given name!",
        {
          errors: {
            project: "You already have a project with the given name!",
          },
        }
      );
    }

    // Create a new project with the data given in the arguments
    const newProject = new Project({
      projectName,
      createdAt: new Date().toISOString(),
      owner: user.id,
      users: [],
    });

    // Save the project and get the result
    const result = await newProject.save();

    return convertProject(result);
  },
  deleteProject: async ({ projectId }, req) => {
    // Verify that the given project Id is valid
    const { errors, isValid } = verifyId(projectId);
    if (!isValid) throw new UserInputError("Invalid project id!", { errors });

    // Check authentication and Get the user id
    if (!req.isAuthenticated) {
      throw new AuthenticationError("Unauthorized!", {
        errors: { authentication: "Unauthorized!" },
      });
    }

    // Check that the project exists
    const project = await Project.findOne({ _id: projectId });

    if (!project) {
      throw new ApolloError("Project does not exist!", {
        errors: { project: "Project does not exist!" },
      });
    }

    // Delete the project with given id
    let result = await Project.deleteOne({ _id: projectId });

    // Return true if the project was deleted properly
    return result !== null;
  },
  addCollaborator: async ({ projectId, username }, req) => {
    // Verify that the given projectId and username are valid
    const { errors, isValid } = verifyId(projectId);
    if (!isValid)
      throw new UserInputError("Invalid project id or username!", { errors });

    // Check authentication and Get the user id
    if (!req.isAuthenticated) {
      throw new AuthenticationError("Unauthorized!", {
        errors: { authentication: "Unauthorized!" },
      });
    }

    // Check that the project and user exist in DB
    const project = await Project.findOne({ _id: projectId });
    const user = await User.findOne({ username });

    if (!project) {
      throw new UserInputError("Project does not exist!", {
        errors: { project: "Project does not exist!" },
      });
    }

    if (!user) {
      throw new UserInputError("Username does not exist!", {
        errors: { username: "Username does not exist!" },
      });
    }

    // Add the user's id to the project's users list if it is not already added
    // Also check that they are not the owner of the project
    if (
      project.owner.toString() !== user._id.toString() &&
      project.users.indexOf(user._id) === -1
    ) {
      // Add the given user's id to the project's users list
      project.users.push(user._id);
    }

    // Save the project and get the result
    const result = await project.save();

    return convertProject(result);
  },
  deleteCollaborator: async ({ projectId, username }, req) => {
    // Verify that the given projectId and username are valid
    const { errors, isValid } = verifyId(projectId);
    if (!isValid)
      throw new UserInputError("Invalid project id or username!", { errors });

    // Check authentication and Get the user id
    if (!req.isAuthenticated) {
      throw new AuthenticationError("Unauthorized!", {
        errors: { authentication: "Unauthorized!" },
      });
    }

    const project = await Project.findOne({ _id: projectId });
    const user = await User.findOne({ username });

    // Check that the project exists in the DB
    if (!project) {
      throw new UserInputError("Project does not exist!", {
        errors: { project: "Project does not exist!" },
      });
    }

    // Check that user exists in DB
    if (!user) {
      throw new UserInputError("Username does not exist!", {
        errors: { username: "Username does not exist!" },
      });
    }

    // Check that the given user is a collaborator of the given project
    if (project.users.indexOf(user._id) != -1) {
      // Remove the given user's id from the project's users list
      const index = project.users.indexOf(user._id);

      if (index > -1) {
        project.users.splice(index, 1);
      }
    }

    // Save the project and get the result
    const result = await project.save();

    return convertProject(result);
  },
};
