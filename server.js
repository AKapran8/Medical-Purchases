const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(__dirname + '/dist/test-task'));
const PORT = process.env.PORT || 8080;

app.get('/*', function (req, res) {

    res.sendFile(path.join(__dirname + '/dist/test-task/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listened on port ${PORT}`)
});
