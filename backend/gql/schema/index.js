const { buildSchema } = require("graphql");

// Type definitions for queries and mutations
// on user objects
module.exports = buildSchema(`
  input UserData {
    firstname: String!
    lastname: String!
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }

  type User {
    id: ID!
    email: String!
    firstname: String!
    lastname: String!
    token: String!
    tokenExpiration: Int!
    username: String!
    createdAt: String!
  }

  type Project {
    id: ID!
    projectName: String!
    owner: ID!
    users: [ID!]
    createdAt: String!
  }

  type Peer {
    peerId: String!
  }

  type File {
    id: ID!
    fileName: String!
    projectId: ID!
    data: String!
    createdAt: String!
  }

  type Query {
    users: [User]
    getOwnProjects: [Project!]
    user(userId: ID!): User!
    signin(username: String!, password: String!): User!
    getProjectCollaborators(projectId: ID!): [User!]
    getNonCollaborators(projectId: ID!): [User!]
    getProject(projectId: ID!): Project!
    getAllProjects(username: String!): [Project!]
    getSharedProjects: [Project!]
    getFile(fileId: ID!): File!
    getFiles(projectId: ID!): [File!]
  }

  type Mutation {
    signup(userData: UserData!): User!
    createProject(projectName: String!): Project!
    deleteProject(projectId: ID!): Boolean!
    addCollaborator(projectId: ID!, username: String!): Project!
    deleteCollaborator(projectId: ID!, username: String!): Project!
    createFile(projectId: ID!, fileName: String!): File!
    deleteFile(fileId: ID!): Boolean!
    addFileData(fileId: ID!, data: String!): File!
    connectToProject(projectId: String!, peerId: String!): [Peer]
    disconnectPeerFromProject(projectId: String!, peerId: String!): Boolean!
    connectToProjectFile(projectId: String!, fileName:String!, peerId: String!): [Peer]
    disconnectPeerFromProjectFile(projectId: String!, fileName:String!, peerId: String!): Boolean!
  }
  
  schema {
    query: Query
    mutation: Mutation
  }
`);
