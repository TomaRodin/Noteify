var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
const { v4: uuidv4 } = require('uuid');
var ejs = require('ejs');
var fs = require('fs');
var app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(cookieParser())
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
    if (req.cookies.LoggedIn == undefined) {
        res.sendFile(__dirname + '/public/home.html')
    } else {
        res.redirect('/user')
    }
})

app.post('/', function (req, res) {
    var username = req.body.user
    var password = req.body.pass
    var users = JSON.parse(fs.readFileSync('./users.json', 'UTF-8'));
    var user = users.find(u => u.name === req.body.user);
    if (username == user.name && password == user.pass) {

        res.cookie('LoggedIn', username)

        res.send({ redirect: true, url: "/user" })
    } else {
        res.redirect('/')
    }
})


app.get('/register', function (req, res) {
    if (req.cookies.LoggedIn == undefined) {
        res.sendFile(__dirname + '/public/register.html')
    } else {
        res.redirect('/')
    }
})

app.post('/register', function (req, res) {
    console.log(req.body.newuser)
    console.log(req.body.newpass)
    var JSONObject = fs.readFileSync(__dirname + '/users.json')

    if (JSONObject.includes(req.body.newuser)) {
        return true;
    }
    else if (JSONObject.includes(req.body.newpass)) {
        return true;
    }

    else if (JSONObject.includes(req.body.email)){
        return true;
    }

    else {
        var array = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
        array.push({
            "name": req.body.newuser,
            "pass": req.body.newpass,
            "mail": req.body.email
        })
        var jsonArray = JSON.stringify(array);
        fs.writeFileSync('./users.json', jsonArray, { encoding: 'utf8', flag: 'w' });
        res.redirect('/')
    }
})

app.get('/user', function (req, res) {
    if (req.cookies.LoggedIn == undefined) {
        res.redirect('/')
    }
    else {
        res.render(__dirname + '/public/user.ejs', { name: req.cookies.LoggedIn })
    }
})

app.get('/user/log_out', function (req, res) {
    if (req.cookies.LoggedIn == undefined) {
        res.redirect('/')
    }
    else {
        res.clearCookie('LoggedIn');
        res.redirect('/')
    }
})

app.get('/user/new', function (req, res) {
    if (req.cookies.LoggedIn == undefined) {
        res.redirect('/')
    }
    else {
        res.sendFile(__dirname + '/public/add.html')
    }
})



app.post('/user/new', function (req, res) {
    var array = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    array.push({
        "name": req.cookies.LoggedIn,
        "title": req.body.title,
        "text": req.body.text,
        "id": uuidv4()
    })
    var jsonArray = JSON.stringify(array);
    fs.writeFileSync('./data.json', jsonArray, { encoding: 'utf8', flag: 'w' });
    res.send({ redirect: true, url: "/user" });
})


app.get('/user/notes/:id', function (req, res) {
    var notes = JSON.parse(fs.readFileSync('./data.json', 'UTF-8'));
    var user = notes.find(u => u.id === req.params.id);
    if (user.name == req.cookies.LoggedIn) {
        res.render(__dirname + '/public/view.ejs', { title: user.title, text: user.text, id:user.id })
    }
    else {
        res.redirect('/user')
    }
})

app.post('/user/:id', function (req, res) {
    var myArray = JSON.parse(fs.readFileSync('./data.json', 'UTF-8'));
    objIndex = myArray.findIndex((obj => obj.id == req.params.id));

    console.log(myArray)

    myArray[objIndex].text = req.body.newtext

    console.log(myArray)
    
    change = JSON.stringify(myArray);

    fs.writeFileSync('./data.json', change, { encoding: 'utf8', flag: 'w' });

    res.send({ redirect: true, url: "/" });
})


app.get('/user/:id/delete', function (req, res) {
    var notes = JSON.parse(fs.readFileSync('./data.json', 'UTF-8'));
    var note = notes.find(u => u.id === req.params.id);
    if (note.name == req.cookies.LoggedIn) {

    var array = JSON.parse(fs.readFileSync('./data.json', 'UTF-8'));
    console.log(array)
    const filterArray = array.filter((item) => item.id !== req.params.id);
    console.log('Deleted')
    console.log(filterArray)
    json = JSON.stringify(filterArray); //convert it back to json
    fs.writeFileSync('./data.json', json, { encoding: 'utf8', flag: 'w' });
    res.redirect('/user')
}   else {
    res.redirect('/')
}
})

app.get('/user/settings',function(req, res){
    if (req.cookies.LoggedIn == undefined){
        res.redirect('/')
    }
    else {
        res.sendFile(__dirname+'/public/settings.html')
    }
})

app.post('/user/settings/delete',function(req, res){
    var array = JSON.parse(fs.readFileSync('./users.json', 'UTF-8'));
    console.log(array)
    const filterArray = array.filter((item) => item.name !== req.cookies.LoggedIn);
    console.log('Deleted')
    console.log(filterArray)
    json = JSON.stringify(filterArray); //convert it back to json
    fs.writeFileSync('./users.json', json, { encoding: 'utf8', flag: 'w' });

    var arrayimage = JSON.parse(fs.readFileSync('./data.json', 'UTF-8'));
    console.log(arrayimage)
    const filterArraydata = arrayimage.filter((item) => item.name !== req.cookies.LoggedIn);
    console.log('Deleted')
    console.log(filterArraydata)
    json = JSON.stringify(filterArraydata); //convert it back to json
    fs.writeFileSync('./data.json', json, { encoding: 'utf8', flag: 'w' });
    res.clearCookie('LoggedIn')
    req.method = 'get'; 
    res.redirect('/'); 
})



app.get('/images', function (req, res) {
    res.sendFile(__dirname + '/public/images/logo.jpg')
})

app.get('/data.json', function (req, res) {
    res.sendFile(__dirname + '/data.json')
})

app.get('user/images/undo.png', function (req, res) {
    res.sendFile(__dirname + '/public/images/undo.png')
})

app.get('/images/back.png',function (req, res) {
    res.sendFile(__dirname + '/public/images/back.png')
})



app.listen(3000)