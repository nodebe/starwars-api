require('dotenv').config()
const http = require('http');
const cors = require('cors');
const port = process.env.PORT || 3000;
const express = require('express');

const app = express();
let server = http.createServer(app)
const routes = require('./router')

app.use(cors());

// api routes
app.use('/api', routes);


server.listen(port);