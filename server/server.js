const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
const { type, resolvers } = require('./schemas');
const { ApolloServer } = require('apollo-server-express');
const { authMiddleware } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = new ApolloServer({
  type,
  resolvers,
  context:authMiddleware
});
server.applyMiddleware({ app });

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}${server.graphqlPath}`)
    console.log(`🌍 Now listening on localhost:${PORT}`);
})
});
