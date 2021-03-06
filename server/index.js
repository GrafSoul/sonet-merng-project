// Environment
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Express
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

// GraphQL Core
import { ApolloServer, PubSub } from 'apollo-server-express';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers/index.js';

// MongoDB Core
import mongoose from 'mongoose';

// Parameters
const CONNECT_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@${process.env.DB_CLUSTER}.nvckw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

const pubsub = new PubSub();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub }),
});

const app = express();
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());

server.applyMiddleware({ app, path: '/api' });

// Load App Page
if (process.env.PROD) {
    app.use(express.static(path.join(__dirname, './client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, './client/build/index.html'));
    });
}

mongoose
    .connect(CONNECT_URL, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
        console.log(`******************************************`);
        console.log(`MongoDB Connected! Successful!`);
        app.listen({ port: PORT });
    })
    .then(() => {
        console.log(`******************************************`);
        console.log(`Server is running on port: ${PORT}`);
        console.log(`URL address: http://localhost:${PORT}`);
        console.log(`URL address API: http://localhost:${PORT}/api`);
        console.log(`******************************************`);
    })
    .catch((error) => {
        console.log(error);
    });
