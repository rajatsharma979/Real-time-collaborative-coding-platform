const express = require('express');
const app = express();
const path = require('path');

const routes = require('./routes/routes');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.use(routes);

app.use((err, req, res, next)=>{
    console.log(err);
    res.send('Hmm Something Went Wrong!!');
});

app.listen(3000, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log('Connected and listening...');
    }
});