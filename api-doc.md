# API DOC

**API Type**

The following api is for graphgql, the flavor exampled here can be used with `apollo` and `express-graphql` and potientally others

**Making Authorized Requests**

Please note authorization is in place, on signup, a token will be provided by the server. For following requests, a authorization header with the token in the following format will be required for authenticated requests

```Bearer {token}```

# Schema

```gql
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
```

# Unauthorized Requests

### Signing up

**Description**

Signs the user up for the app given the required info (reference schema)

**Example**

```gql
    mutation signup() {
        signup(
            userData: {
                username: "myUsername"
                firstname: "myFirstName myMiddleName1 myMiddleName2"
                lastname: "bestLastname"
                email: "amazing.email@nomansland.com"
                password: "notPassword123"
                confirmPassword: "notPassword123"
            }
        ) {
            id
            username
            firstname
            lastname
            email
            token
            createdAt
        }
    }
```

### Signing in
**Description**

Signs the user in given a username and password

**Example**

```gql
    query signin() {
        signin(username: "myUsername", password: "notPassword123") {
            id
            username
            firstname
            lastname
            email
            token
            createdAt
        }
    }
```
# Authorized Requests

# Project Related

### Creating A Project
**Description**

Creates the given project (reference schema)


**Example**
```gql
    mutation createProject {
        createProject(projectName:"Example") {
            id,
            createdAt
        }
    }
```
### Deleting A Project
**Description**

Deletes the given project (reference schema)

**Example**
```gql
    mutation deleteProject {
        deleteProject(projectId:"606a40be2194b839642f9670")
    }
```
### Getting List of Owned Projects
**Description**

Gets list of owned projects (reference schema)

**Example**
```gql
    query getOwnProjects {
        getOwnProjects()
    }
```
### Getting List of Shared Projects
**Description**

Gets list of shared projects (reference schema)

**Example**
```gql
    query getSharedProjects {
        getSharedProjects()
    }
```
# Project Collaborator Related

### Adding A Collaborator
**Description**

Deletes the collaborator from the given project (reference schema)

**Example**
```gql
    query getProjectCollaborators {
        getProjectCollaborators(projectId: "606a40be2194b839642f9670") {
            firstname,
            lastname,
            email
        }
    }
```
### Deleting A Collaborator
**Description**

Adds a collaborator to the given project (reference schema)

**Example**
```gql
    query deleteProject {
        deleteProject(projectId: "606a40be2194b839642f9670")
    }
```
# File Related

### Getting a List of Files in the Project
**Description**

Returns a list of files in the Project

**Example**
```gql
    query getFiles {
        getFiles(
            projectId: "606a40be2194b839642f9670"
        ) {
            id,
            fileName
        }
    }
```
### Creating A File
**Description**

Creates the given file

**Example**
```gql
    mutation createFile {
        createFile(projectId: "606a40be2194b839642f9670", fileName: "Testing") {
            id
        }
    }
```
### Deleting A File
**Description**

Deletes the referenced file (reference schema)

**Example**
```gql
    mutation deleteFile {
        deleteFile(fileId: "606d595c3ec8fc215058e28a")
    }
```

### Changing A File
**Description**

Changes the references file with the given string data (reference schema)

**Example**
```gql
    mutation deleteFile {
        deleteFile(fileId: "606d595c3ec8fc215058e28a")
    }
```
### Reading A File
**Description**

Gets the data in the file (reference schema)

**Example**
```gql
    mutation addFileData {
        addFileData(fileId:"606d595c3ec8fc215058e28a", data:"Hello World!") {
            id
        }
    }
```
# User Related

### Getting a list of users
**Description**

Gets a list of users (reference schema)

**Example**
```gql
    query getUsers {
        users {
            firstname,
            lastname,
            username,
        }
    }
```
# Caching related

### Caching Project Connection
**Description**

Caches a user's unique peer connection id to the project

**Example**
```gql
    mutation connectToProject {
        connectToProject(
            projectId: "606a40be2194b839642f9670", 
            peerId:"48558d94-9757-4429-b139-ef9cb9da8101"
        ) {
            peerId
        }
    }
```

### Removing Cached Project Connection
**Description**

Removes the user's unique connection id from the project

**Example**
```gql
    mutation disconnectPeerFromProject {
        disconnectPeerFromProject(
            projectId: "606a40be2194b839642f9670", 
            peerId:"48558d94-9757-4429-b139-ef9cb9da8101", 
        )
    }
```
### Caching File Connection
**Description**

Caches a user's unique peer connection id to the project file

**Example**
```gql
    mutation connectToProjectFile {
        connectToProjectFile(
            projectId: "606a40be2194b839642f9670", 
            peerId:"48558d94-9757-4429-b139-ef9cb9da8123", 
            fileName:"Test2"
        ) {
            peerId
        }
    }
```
### Removing Cached File Connection
**Description**

Removes the user's unique connection id from the project file

**Example**
```gql
    mutation disconnectPeerFromProjectFile {
        disconnectPeerFromProjectFile(
            projectId: "606a40be2194b839642f9670", 
            peerId:"48558d94-9757-4429-b139-ef9cb9da8123", 
            fileName:"Test2"
        )
    }
```