const usersResolvers = require("./users");
const projectsResolvers = require("./projects");
const filesResolvers = require("./files");
const projectCacheResolvers = require("./activeCache");

// Export the queries and mutations associated with user objects
module.exports = {
  ...usersResolvers,
  ...projectsResolvers,
  ...filesResolvers,
  ...projectCacheResolvers,
};
