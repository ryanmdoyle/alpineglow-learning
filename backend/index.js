const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const typeDefs = require('./gqlSchema');
const queries = require('./resolvers/queries');
const mutations = require('./resolvers/mutations');
const subscriptions = require('./resolvers/subscriptions');
const dateScalar = require('./resolvers/dateScaler');

const resolvers = {
  Mutation: mutations,
  Query: queries,
  Date: dateScalar,
  Subscription: subscriptions,
}

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
// Pass into ApolloServer below?
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

//// TEMP REST LOGIN/LOGOUT ////
const login = require('./controllers/login');
const logout = require('./controllers/logout');
app.post('/auth/google/login', login);
app.post('/auth/google/logout', logout);
///////////////////

const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    if (connection) return connection.context;
    const { token } = req.cookies;
    if (token) {
      const tokenData = jwt.verify(token, process.env.SECRET);
      req.currentUser = tokenData;
    } else {
      req.userId = null;
    }
    return { ...req }
  },
  subscriptions: {
    path: '/subscriptions'
  }
});

server.applyMiddleware({
  app,
  path: '/graphql',
  cors: false,
});
server.installSubscriptionHandlers(httpServer);


httpServer.listen({ port: 4000 }, () => {
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  console.log(`🚀 Subscriptions ready at ws://localhost:4000${server.subscriptionsPath}`)
})