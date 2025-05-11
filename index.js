const express = require('express');
var cors = require('cors')
const app = express();
const port = process.env.port || 5000;

app.use(cors())


app.get("/", (req, res) => {
    res.send("Welcome to OneDrop.")
})

app.listen(port, () => {
    console.log(`OneDrop is running on port ${port}`);
})