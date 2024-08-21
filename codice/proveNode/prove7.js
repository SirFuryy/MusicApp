const express = require('express')
const app = express()
const personeRouter = require('./route/persone');

app.use(express.json());

/**
 * invece di avere tutto qui, un file lunghissimo, chiamiamo tanti file esterni, ciascuno per 
 * gestire una categoria di route diverse, così che qua sia tutto pulito. Nella chi8amata ai file
 *  esterni dovremo dire di usare il percorso che ci interessa e che è uguale per ciascuna di quelle
 * route
 */ 
app.use('/api/persone', personeRouter);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const port = 3000
app.listen(port, () => console.log(`Example app listening on port ${port}!`))