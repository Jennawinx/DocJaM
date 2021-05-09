const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");

// To access data from .env file
require("dotenv").config();

// Get the typeDefinitions and graphql resolvers
const gqlSchema = require("./gql/schema/index");
const gqlResolvers = require("./gql/resolvers/index");
const isAuthenticated = require("./utils/isAuthenticated");
const app = express();

const port = process.env.PORT || 5000;
app.use(cors());

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(isAuthenticated);

app.use(
  "/api",
  graphqlHTTP({
    schema: gqlSchema,
    rootValue: gqlResolvers,
    graphiql: true,
  })
);

app.get("/", (req, res, next) => {
  res.send("Markdown editor!");
});

// Connect to mongodb server
mongoose
  .connect(process.env.MONGO_SERVER, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });
