
# Running dev

* The tech stack is MERN (MongoDB, ExpressJS, ReactJS, NodeJS)
* Make sure you are on a `dev` branch

## Start the backend

```bash

  cd backend
  node app.js

```

## Start the frontend


```bash

  cd client
  npm install
  npm install graphql
  npm start

```

## Notes

### Project Creation

[Followed tutorial](https://www.freecodecamp.org/news/create-a-react-frontend-a-node-express-backend-and-connect-them-together-c5798926047c/)

* Frontend was created with `npx create-react-app`
* Backend was created with `npx express-generator`

### Frontend Notable Structure
* src
    * urls: frontend page routes
    * router: routes routes to component pages and handles authentication
    * contextTypes
        * authentication: handles logic for authentication check
    * PeerifyV2: our custom peer2peer module
        * V1 had illegal hook states, whoops

# Archectitural Comments
* The peer to peer network is built using an acylic graph.
* Messages are transferred via flooding (Beware of infinite loops due to cycles)
* The project uses 2 levels of peer2peer network
    * A global one: for file navigation, chat, and peer status
    * A local one: for document change communication
* 2 levels were choosen so that users not involved in the same file will not be 
  spamming other users with edit changes, but still allow peers to communicate via the project connection
* The server caches the relevant active peers in a project
* When a peer joins, they will cache to the server and query the server for the connected peers
* Dued to possible stale states, the most recently connected peer will be choosen to connect to
* However, for large projects this isn't optimal as this is a linear graph, but due to time contraints, this was the naive approach taken

# Potential Optimizations
* Have document rerender the only section that was changed instead of the whole doc
* Add resilience to peer2peer network when users leave
    * **Idea**: create an inner graph of the network, when the user's direct upstream peer disconnects, reconnect them to some other upstream peer of avaliable 
* Optimize peer discovery

# Project Dependencies

#### Frontend

1. React CodeMirror Editor
    * DOCS https://uiwjs.github.io/react-codemirror/
    * Original https://codemirror.net/

2. Showdown Markdown and HTML Convertor
    * GIT https://github.com/showdownjs/showdown

3. PeerJS
    * DOCS https://peerjs.com/

4. Apollo Client V2
    * DOCS https://www.apollographql.com/docs/react/

#### Backend

1. express-gql
    * DOCS https://graphql.org/graphql-js/running-an-express-graphql-server/
    * GIT  https://github.com/graphql/express-graphql


# Other Useful API DOCS
* react-router-dom https://reactrouter.com/web/api/Route

# Project Feature Ideas
1. Project Creation
    - add users to project
    - upload project
2. Project Contain Sections (folders - support 1 level of nesting only)
    - add/remove (folders) 
3. Sections Contain Pages
    - can add/remove page
    - can autofill and link pages (maybe a table of content builder?)
4. Edit Page
    - Many users can edit
    - Editing has realtime rendering
5. Project Export
    - Export markdown
    - Export static html website
        - Can edit styling for site
