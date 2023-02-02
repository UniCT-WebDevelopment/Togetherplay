const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const express = require('express');
const app = express(); 
const router = express.Router();


var path = require('path');

const rootPath = path.join(__dirname, '..', '..',);
const con=require(path.join(rootPath, "modules", "connection","connection.js"))

//let sessioni = require(path.join(rootPath, "modules", "session.js"));

let sessioni = new Array();
app.use(express.static("./"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { 
        path:"/login",
        maxAge: oneDay },
    resave: false
}));



router.get('/login', getLogin);
//router.post('/login', postLogin);

/*
router.get('/current', getCurrent);
router.get('/logout', logout);
router.get('/getUsersByUsername', getUsersByUsername);
router.post('/login', login);
router.post('/signIn', signIn);
*/


async function getUtente(userid) {
    return new Promise(function (resolve, reject) {
        var quer = "SELECT * FROM utenti where id_utente=" + userid;
        con.query(quer, function (err, result) {
            if (err) throw err;
            resolve(result);
        });
    });

}

async function getLogin(req, res, next) {

    let sessionId = req.sessionId;
    console.log("---session----" +req.sessionId );

    if (sessioni[sessionId]) {
        console.log("log with " + sessioni[sessionId].userid);
        let utente = await getUtente(sessioni[sessionId].userid);
    }

    const filePath = path.join(rootPath, 'public', "login.html");
    res.sendFile(filePath);
}


router.post("/login",async (request, response) => {

    var email = request.body.email;
    var password = request.body.password;
    var myQuery1 = "Select * from utenti where email='" + email + "' and password='" + password + "'";
    console.log(myQuery1);

    console.log("rquestsession "+request.session);

    let res = await new Promise((resolve, reject) => con.query(myQuery1, (err, results) => {
        if (err) {
            reject(err)
        } else {
            resolve(results);
        }
    }))
        .then((res) => {
            if (res.length > 0) {
                Object.keys(res).forEach(function (key) {
                   let row = res[key];
                    let sessionTmp = request.session;
                    let sessionId = request.sessionId;
    

                    console.log(sessionTmp);

                    sessionTmp.userid = row.id_utente;

                    console.log(row.id_utente);
                    console.log(sessionId);
                    console.log(sessionTmp);
                    sessioni[sessionId] = sessionTmp;

                    response.send(JSON.parse('{"message": "1"}'));
                });
            }
            else {
                console.log("NomeUtente o Password Errati");


                response.send(JSON.parse('{"message": "0"}'));
            }
        })
        .catch((error) => {
            console.error("Errore" + error);
        });
});




module.exports = router;


