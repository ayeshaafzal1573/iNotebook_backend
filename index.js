// backend/index.js

const express = require('express');
const connectToMongo = require('./db');


const app = express();
const port = 5000;
//middleware 
app.use(express.json());
connectToMongo();

// available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))
// Start the server
app.listen(port, () => {
    console.log(`iNotebook backend is running on http://localhost:${port}`);
});
