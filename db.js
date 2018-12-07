const bcrypt = require('bcryptjs');
var validator = require("email-validator");
const mongodb = require('mongodb');

function createUser(username, password, email,address,city, res) {
    const cryptPwd = bcrypt.hashSync(password, 10);

    global.db.collection("users").findOne({ "email": email }, function (err, docEmail) {
        if (err) { throw 'Erro ao verificar!' }
        console.log("DocEmail\n" + docEmail);
        if (username == null || username == '') {
            res.render('signup', { message: 'Campo username não preenchido!' });
            return;
        }
        console.log(password);
        if (password == null || password == '') {
            res.render('signup', { message: 'Campo senha não preenchido!' });
            return;
        }
        if (email == null || email == '') {
            res.render('signup', { message: 'Campo email não preenchido!' });
            return;
        }
        if (address == null || address == '') {
            res.render('signup', { message: 'Campo endereço não preenchido!' });
            return;
        }
        if (city == null || city == '') {
            res.render('signup', { message: 'Campo cidade não preenchido!' });
            return;
        }

        if (!validator.validate(email)) {
            res.render('signup', { message: 'Email mal formatado!' });
            return;
        } else {
            if (docEmail != null) {
                res.render('signup', { message: 'Email já utilizado!' });
                return;
            } else {
                global.db.collection("users").findOne({ "username": username }, function (err, docUsername) {
                    if (err) {
                        res.render('signup', { message: 'Erro ao verificar usuário!' });
                        return;
                    }
                    console.log("DocEmail\n" + docEmail);
                    if (docUsername != null) {
                        res.render('signup', { message: 'Usuário já cadastrado!' });
                        return;
                    } else {
                        const adm = 0;
                        global.db.collection("users").insertOne({ username, password: cryptPwd, email,address,city, adm }, function (err, result) {
                            res.redirect('/');
                        });
                    }
                });
            }
        }
    });
}

function createNews(title, image, paragraph, res) {
    if (title == null || title == '') {
        res.render('noticia', { message: 'Campo titulo não preenchido!' });
        return;
    }
    if (paragraph == null || paragraph == '') {
        res.render('noticia', { message: 'Campo paragrafo não preenchido!' });
        return;
    }

    global.db.collection("news").insert({ title, image, paragraph }, function () {
        res.redirect('/noticias');
    });
}

function getNews() {
    return global.db.collection("news").find({}).toArray();
}


function deleteNews(id) {
    db.collection("news").deleteOne({ _id : mongodb.ObjectId(id) },function(err,results){
        console.log(`Request success : ${results.result.ok}, documents deleted : ${results.result.n}`);
    });
}

module.exports = { createUser, createNews, getNews, deleteNews }