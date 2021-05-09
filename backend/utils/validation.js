const validator = require("validator");
const mongoose = require("mongoose");

module.exports.verifySignUpData = function (
  username,
  firstname,
  lastname,
  email,
  password,
  confirmPassword
) {
  let errors = {};

  if (validator.isEmpty(username) || !validator.isAlphanumeric(username))
    errors.username = "Invalid username!";

  if (validator.isEmpty(email)) errors.email = "Email should not be empty!";
  else if (!validator.isEmail(email)) errors.email = "Email should be valid!";

  if (validator.isEmpty(firstname))
    errors.firstname = "First name should not be empty!";

  if (validator.isEmpty(lastname))
    errors.lastname = "Last name should not be empty!";

  if (password.length < 8)
    errors.password = "Password should be at least 8 characters in length!";
  else if (password !== confirmPassword)
    errors.confirmPassword = "Both passwords have to match!";

  const result = { errors, isValid: Object.keys(errors).length === 0 };

  return result;
};

module.exports.verifySignInData = function (username, password) {
  let errors = {};

  if (validator.isEmpty(username) || !validator.isAlphanumeric(username))
    errors.username = "Invalid username!";

  if (validator.isEmpty(password))
    errors.password = "Password should not be empty!";

  const result = { errors, isValid: Object.keys(errors).length === 0 };

  return result;
};

module.exports.verifyFileInfo = function (projectId, fileName) {
  let errors = {};
  if (!mongoose.Types.ObjectId.isValid(projectId))
    errors.projectId = "Invalid id!";

  if (validator.isEmpty(fileName))
    errors.fileName = "File name should not be empty!";

  const result = { errors, isValid: Object.keys(errors).length === 0 };

  return result;
};

module.exports.verifyProjectInfo = function (projectName) {
  let errors = {};

  if (validator.isEmpty(projectName))
    errors.projectName = "Project name should not be empty!";

  const result = { errors, isValid: Object.keys(errors).length === 0 };

  return result;
};

module.exports.verifyId = function (id) {
  let errors = {};
  if (!mongoose.Types.ObjectId.isValid(id)) errors.id = "Invalid id!";

  const result = { errors, isValid: Object.keys(errors).length === 0 };

  return result;
};
