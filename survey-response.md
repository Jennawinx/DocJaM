# Survey responses (Copy and paste to survey)

The last three answers are important for me to determine your challenge factor. Please make sure to provide insightful comment. 

## What is your team name? *

JAM

## What is the deployed URL to test your app? *

https://rocky-forest-98292.herokuapp.com/

## How did you deploy your app? What technology did you use?

For deployment
- Heroku

Tech Stack
- MERN (MongoDB, ExpressJS, ReactJs, NodeJS)

Technologies
- Graphql
- peer2peer for webRTC

Notable Libraries Frontend
- apollo client for client graphql
- peerJS for creating a peer-2-peer webRTC network
- code mirror for the editor
- showdownJS for markdown to html conversion
- antd component library

Notable Libraries Backend
- express-gql for server graphql
- mongoose for mongoDB

## Do I need to install something to use your app (mobile app or browser extension)? If yes, please explain how to set it up.

No

## Should I use use your app using?

Web browser on the laptop

## If needed, I am assuming that I can create a user account easily. However, if I need a specific account (like an admin account), please create one and write as a comment below the username and password) for me to test.

No admin account needed

## What is the #1 most challenging thing that you have learned/developed for your app? *

Making a webRTC application from scratch was the most challenging thing we've developed for our app.
At the beginning, figuring out how to even start building the app was difficult, we spent about 2 weeks looking for a library we could easily understand and wasn't outdated to start off with, however, many of the tutorials either didn't work anymore or they were way too bloated for us to understand. When we began to lose hope, we finally came across an open sourced peer-2-peer library built with vanilla javascript that was still maintained and so the challenge of building a peer-2-peer network from scratch began.

First off, incorporating a pure JS library with React's framework was no easy task. There were barely any tutorials on this and we ran into a lot of state issues, stale connection issues, and socket issues from react's rendering lifecycle. Most of the time, the react state would pre-maturely kill the connection, restart it, or even start multiple at once. It took a lot of fiddling with and looking into higher level hooks and react techniques to solve these state issues.

After we finally got 2 peers connecting, the next difficult task was figuring out how to construct the peer-2-peer network so that data could be passed across the network. We came across many options, the first was to connect everyone to one peer, however, that would put a lot of weight onto one peer, the second was to connect everyone with everyone, but then there would be a lot of redundancy in the network, and we were worried about the performance of that on top of rendering everyone's changes (though, for the practical use of this application, we now realize that it probably wouldn't have made much of a difference and might have made our lives a bit easier). Finally we settled with the third option which was to build a sparsely connected acrylic graph using a simple flooding algorithm used in networking. (The future advantage of this is we could ping peers to create a minimum spanning tree for the fastest communication possible). 

With our chosen network architecture, we had to figure out how to connect users automatically and more securely via the server. Our decision was to maintain a cache in the server that would determine active peers in a project or document to connect new peers to. However, maintaining an up-to-date cache posed a lot of challenges since the user could disconnect in many ways without notifying the server. We had to then come up with an algorithm to counter this. Naively, we choose to connect peers via the last most active user by searching through the cache from the most recent user until either one or none was found. This improved the connection rates by a whole lot (However, for scalability, the algorithm should be smarter). 

Lastly, organizing the various types of messages and callback handlers through the peer-2-peer networks was hard to get right. The file navigator, chat, and document editor were all communicated through peer-2-peer. However, to make the app more efficient, we used 2 levels of peer-2-peer networks, a global one for all peers in the project, this would be used for the file navigator and the chat, and a local network for the users editing in the same document. The reason for the 2 levels was so that peers who weren't working on the same document won't be spammed with updates from peers working on another.

Overall, creating a webRTC app from scratch with a custom peer-2-peer network into React was a big challenge and was extremely time consuming to work out. However, we learnt a lot and were able to use a lot of networking knowledge and algorithms into this.

## What is the #2 most challenging thing that you have learned/developed for you app? *

Learning Graphql was challenging as it is extremely different from how REST APIs are implemented.  Both of us were accustomed to using traditional REST APIs for implementing web applications and therefore, initially found it difficult to understand and figure out how to make requests using GraphQL queries and mutations. We've watched several tutorials and read various documentations to learn how to work with GraphQLl then finally, we learned how to define schemas for the queries and mutations, and implement the resolvers that were needed.

Another challenge we faced was deciding which middleware to use to create a GraphQL server. We began using Apollo Server as it provided us with a nice GUI platform which allowed us to run and test our queries and mutations. It also provided us with a simple format to define the types for our queries and mutations and to implement the resolvers for them. However, we ran into difficulties when we began working on authentication and authorization of users. We implemented authentication through attaching an authorization header that contains a JSON Web Token to the requests that we made from the frontend and then verifying it on the backend. However, the authorization header was not being passed to the backend along with the requests and we had spent several days debugging this issue. We read different Apollo Server documentation and tried to implement authentication in different ways. However, we were unable to tackle this issue quickly enough. As a result, we changed our backend to use express-graphql instead. 

Changing to Express-GraphQL required us to modify the way we defined the schema and resolvers for the queries and mutations. However, it made it easier to create a GraphQL server API on the backend using Express. It also made it simpler to implement authentication as we were able to pass our custom made authentication middleware to app.use() so that it is applied to every received request. Our authentication middleware attaches a boolean field to the incoming request that helps verify whether or not it is authenticated. Due to this, it made it much easier to handle authentication on the backend as it just required us to do a simple check to verify if the boolean field was true or false in our resolvers. We were also able to attach the authorization header to each request we send from the frontend using the Apollo Link library provided by Apollo Client, which is a library that helps make GraphQL requests.

Therefore, these are a few challenges we faced with learning and using GraphQL for our project and how we resolved them.

## What is the #3 most challenging thing that you have learned/developed for you app? *

The 3rd most challenging thing that we had to learn for our app was the "React State Handling Package'' (React state, hooks & redux). We had to learn to use various state handling features of react for our project including the useState, useEffect, useContext, and useRef hooks. Although the use of these hooks allowed us to use state, components and other features without the need to write a class, one thing we found particularly challenging was using useState to create state variables. We used this Hook to create and update the state of variables that we pass as parameters to GraphQL queries and mutations which the Hook would return a variable as well as a function that we can use to update the value of the variable. However, since this function works asynchronously, we often ran into issues where the states of the variables were not being set before they are used by the queries. This is mainly due to our lack of familiarity with React and how this feature is normally used, making it difficult for us to debug our app effectively and it was even harder to determine which part of our code was causing the problems. So we had to read through various documentations, especially on how to use useState and make sure that the function calls used to update the state variables are placed in the right locations in our code to avoid async issues. We also found it challenging to figure out how to use callbacks in promises to catch errors and prevent React from looping errors.

Another challenge we faced was the illegal use of hooks. Initially, we kept using useState hooks in callback handlers and this resulted in inconsistent and stale state. Due to this, the state did not update or render as expected. Our inexperience with this feature and unfamiliarilarity with React made everything even more difficult to debug. Consequently, we had to watch several tutorials and continue going through even more in depth documentations and examples before we were able to understand better and fix our issues. Refactoring made our code finally work better however, it was really time consuming and frustrating.
 
Other concepts that were challenging for us to learn and understand include the React high level life cycle, the useEffect hook and how to determine the rendering order of the functions and components in our app. Working with useEffect was difficult to understand as it behaved differently with different parameters. For example, if we forgot to put the dependency vector (one of the parameters of useEffect), it caused the function inside to run after every re-render. Moreover, forgetting to put variables inside the dependency vector parameter caused the function inside to only run once whereas putting too many variables caused it to render multiple times. Initially we found it extremely challenging to determine why our app was not behaving as expected however, with the help of documentation and trial and error, we were able to understand which parameters to pass into the useEffect hook to get the desired behaviour. Another issue we faced with the useState hook was that it caused infinite render loops when we used both state and setState within it. We also learned that in order to extract the state from third party, non-React components, we had to use Refs instead of States. Therefore, these are the main challenges we faced with the “React State Handling Package”.
