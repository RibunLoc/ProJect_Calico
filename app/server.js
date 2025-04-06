const express = require('express');
const path   = require('path');
const app = express();
const port = process.env.PORT || 80;

app.use(express.static(path.join(__dirname)));

app.listen(port,() => {
    console.log(`Server is running on port ${port}`);
    console.log(`http://localhost:${port}`);
});