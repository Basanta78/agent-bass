const express = require('express');
const app = express();
const routes = require('./routes');
const cors = require('cors');

app.use(cors()); 


app.use(express.json());
app.use('/api', routes);

let x = 42;
// await x; // Noncompliant

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
