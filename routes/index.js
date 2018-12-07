var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var fs = require('fs');

var passport = require('passport');
const upload = multer({
  dest: path.join(__dirname + "/../public/temp")
});

function authenticationMiddleware() {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.render('login', { message: 'Usuário não logado ou sem autorização!' });
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  let newsQuery = db.getNews();
  newsQuery.then(function (result) {    
    res.render('index', { news: result });
  });
});

router.get('/news', function (req, res, next) {
  let newsQuery = db.getNews();
  newsQuery.then(function (result) {        
    res.send(result);
  });
});

router.get('/login', function (req, res) {
  if (!req.isAuthenticated()) {
    if (req.query.fail)
      res.render('login', { message: 'Usuário e/ou senha incorretos!' });
    else
      res.render('login', { message: null });
  }else{
    res.redirect('/');
  }
});

router.post('/login',
  passport.authenticate('local', { successRedirect: '/noticias', failureRedirect: '/login?fail=true' })
);

router.get('/signup', function (req, res, next) {
  if (!req.isAuthenticated()) {
    if (req.query.fail)
      res.render('signup', { message: 'Falha no cadastro do usuário!' });
    else
      res.render('signup', { message: null });
  } else {
    res.redirect('/');
  }
})

const db = require('../db')
router.post('/signup', function (req, res, next) {
  db.createUser(req.body.username, req.body.password, req.body.email, req.body.address, req.body.city, res);
})

router.get('/noticias', authenticationMiddleware(), function (req, res) {
  let newsQuery = db.getNews();
  newsQuery.then(function (result) {
    res.render('noticias', { news: result });
  });
})

router.post('/noticias/delete', authenticationMiddleware(), function (req, res, next) {
  db.deleteNews(req.body.id);
  res.redirect('/noticias');
})

router.get('/noticia', authenticationMiddleware(), function (req, res, next) {
  res.render('noticia');
})

router.post('/noticia', authenticationMiddleware(), upload.single("file"), function (req, res, next) {
  if (req.file) {
    const tempPath = req.file.path;
    const pictureName = req.file.originalname.replace(/ /g, "-");
    const targetPath = path.join(__dirname, "/../public/images/" + pictureName);

    fs.rename(tempPath, targetPath, err => {
      if (err) return res.send("Erro " + err);
      db.createNews(req.body.title, pictureName, req.body.paragraph, res);
    });
  } else {
    db.createNews(req.body.title, '', req.body.paragraph, res);
  }
});

router.post("/search", function (req, res) {
  global.db.collection('news').find({
    "title": { $regex: "(?i).*" + req.body.query + ".*" }
  }).toArray(function (err, items) {
    res.render('search', { news: items });
  })
});

router.get('/logout', function(req, res){
  req.session.destroy(function (err) {
    res.redirect('/'); //Inside a callback… bulletproof!
  });
});

module.exports = router;
