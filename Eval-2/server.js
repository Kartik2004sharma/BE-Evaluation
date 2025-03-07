const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));
app.use(express.static('public'));

app.get('/',(req,res)=>{
    res.render('index');
});

app.listen(PORT,()=>{
    console.log(`Server running at port ${PORT}`);
});