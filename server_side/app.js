const express = require('express');
const { request } = require('express');
const app = express();
const port = 3000;
const mainProcc = require('../index');


app.use(express.urlencoded());
app.use(express.json());


app.get('/', (request, response) => {
    response.send('Hello from Express!')
})

app.post('/site', (request, response) => {
    console.log('req body', request.body);
    mainProcc.runServer(request.body.sites);
    response.send('Hello from site Express!')
})

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})