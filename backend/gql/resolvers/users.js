const { sign } = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../../dbModels/User");
const {
  verifySignUpData,
  verifySignInData,
} = require("../../utils/validation");

// Error from Apollo
const { UserInputError, ApolloError } = require("apollo-server");

// To access data from .env file
require("dotenv").config();

// JWT token creation
let createToken = (user) => {
  return sign(
    {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      email: user.email,
    },
    process.env.SECRET,
    { expiresIn: "2h" }
  );
};

// Queries and mutations on users DB
module.exports = {
  user: async ({ userId }) => {
    return User.findOne({ _id: userId })
      .then((user) => {
        return {
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          id: user._id,
          password: user.password,
        };
      })
      .catch((err) => {
        throw err;
      });
  },
  users: async () => {
    try {
      const users = await User.find();
      return users.map((user) => {
        return {
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          id: user._id,
          password: user.password,
        };
      });
    } catch (err) {
      throw err;
    }
  },
  signin: async ({ username, password }) => {
    const { errors, isValid } = verifySignInData(username, password);

    if (!isValid) throw new UserInputError("Invalid input(s)!", { errors });

    const user = await User.findOne({ username });

    if (!user)
      throw new UserInputError("Username does not exist!", {
        errors: { username: "Username does not exist!" },
      });

    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword)
      throw new UserInputError("Incorrect username or password!", {
        errors: { message: "Incorrect username or password!" },
      });

    const token = createToken(user);

    return {
      id: user._id,
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      password: user.pasword,
      createdAt: user.createdAt,
      token,
      tokenExpiration: 2,
    };
  },

  signup: async ({ userData: args }) => {
    let { errors, isValid } = verifySignUpData(
      args.username,
      args.firstname,
      args.lastname,
      args.email,
      args.password,
      args.confirmPassword
    );

    if (!isValid) throw new UserInputError("Invalid input(s)!", { errors });

    // Check that user does not already exist in DB
    return User.findOne({ username: args.username })
      .then((user) => {
        if (user)
          throw new UserInputError("Username already exists!", {
            errors: { username: "Username already exists!!" },
          });
        // Create a hashed password
        return bcrypt.hash(args.password, 12);
      })
      .then((password) => {
        // Create a new user with the data given in the arguments
        const newUsr = new User({
          username: args.username,
          firstname: args.firstname,
          lastname: args.lastname,
          email: args.email,
          password,
          createdAt: new Date().toISOString(),
        });
        // Save the new user
        return newUsr.save();
      })
      .then((result) => {
        const token = createToken(result);

        return {
          username: result.username,
          email: result.email,
          firstname: result.firstname,
          lastname: result.lastname,
          createdAt: result.createdAt,
          id: result._id,
          password: result.password,
          token,
          tokenExpiration: 2,
        };
      })
      .catch((err) => {
        throw err;
        /*  throw new ApolloError("Database error: User could not be created!", {
          errors: { database: "Database error: User could not be created!" },
        }); */
      });
  },
};
