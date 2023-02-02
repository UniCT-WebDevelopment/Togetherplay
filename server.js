var con = require('./modules/connection/connection.js');
var mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const express = require('express'); //Import the express dependency
const app = express();              //Instantiate an express app, the main work horse of this server
const port = 3001;                  //Save the port number where your server will be joining

var jsonPath = path.join(__dirname, 'modules', 'connection', 'dbConfig.json')

let rawdata = fs.readFileSync(jsonPath);
let connectionData = JSON.parse(rawdata);
const DATABASENAME = connectionData.databasename;

const server = app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});



const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
})




app.use(express.static('./public'));
//app.use(express.static("./"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());



app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'public', "index-2.html");
  res.sendFile(filePath);
});


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Methods', 'Content-Type', 'Authorization');
  next();
})



const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false
}));

connectedPartecipant = new Array();

let sessioni = new Array();
var openRooms = [];
var timeRoom = [];
var partecipans = new Array();
var RequestTimeSocket;


function addPartecipant(room, partecipant) {
  if (openRooms[room]) {
    if (!existsPartecipant(room, partecipant)) {
      partecipans = openRooms[room]
      partecipans.push(partecipant);
      openRooms[room] = partecipans;
    }
  }
  else {
    partecipans = [];
    partecipans.push(partecipant);
    openRooms[room] = partecipans;
  }
}

function addTime(minute, room) {
  if (minute > 0) timeRoom[room] = minute;

}

io.sockets.on('connection', function (socket) {
  socket.on('join-room', function (room, userId, username, partecipant) {
    socket.room = room;
    socket.id_utente = partecipant.id_utente;
    socket.username = partecipant.username;
    socket.join(room);

    addPartecipant(room, partecipant);
    console.log(socket.username + " JOINED ROOM " + room);

    socket.broadcast.to(socket.room).emit("user-connected", userId);
    socket.broadcast.to(socket.room).emit("chat_log_message", '<strong>' + socket.username + "</strong>" + " Enter in Room");


    socket.on('chat_message', message => {
      console.log("send" + message);
      socket.broadcast.to(socket.room).emit("chat_message", socket.username, message);
    });


    socket.on('getReproduceTime', function () {
      RequestTimeSocket = socket;

      socket.broadcast.to(socket.room).emit("getReproduceTime");
    });


    socket.on('sendReproduceTime', function (minute) {

      console.log("sending " + minute);
      RequestTimeSocket.emit("play", minute);

    });


    setInterval(function () {
      if (openRooms[socket.room].length <= 0) {
        clearInterval(this)
      }
      else
        io.sockets.in(socket.room).emit('connectedPartecipant', openRooms[room]);
      //console.log("Sending..." + room);
      //console.log(openRooms[room]);
      //console.log("-------------------");
    }, 1000 * 10);



    /*
    socket.on('playFT', function () {
      //RequestTimeSocket=connection;

        console.log(openRooms[socket.room].length);
      if (openRooms[socket.room].length > 1) {
        console.log("emit getCurrentTime");
        socket.broadcast.to(socket.room).emit("getCurrentTime");

        socket.on("getCurrentTime", currentTime => {
          console.log("emit layFt with currentime");
          socket.broadcast.to(socket.room).emit("playFT", currentTime);
        });
      }
    });
*/

    socket.on('play', function (minute) {
      console.log("onPlay");
      socket.broadcast.to(socket.room).emit("play", minute);
    });

    socket.on('pause', function (minute) {
      socket.broadcast.to(socket.room).emit("pause", minute);
    });




    socket.on('refreshUrl', function (urlVideo) {
      console.log("emit refreshUrl " + urlVideo);
      socket.broadcast.to(socket.room).emit("refreshUrl", urlVideo);
    });



    socket.on('disconnect', function () {
      socket.broadcast.to(socket.room).emit("chat_log_message", '<strong>' + socket.username + "</strong>" + " left the Room");
      console.log("Disconntected user" + socket.id_utente);
      var part = getPartecipantById(socket.id_utente, socket.room);
      removePartecipant(part, socket.room);
      if (openRooms[room].length <= 0) {
        socket.leave(room);
        console.log("No one in room. Closing room...");
      }
    });


  });
});









function getPartecipantById(idUtente, room) {
  if (!idUtente) return -1;
  var parteciapnts = openRooms[room];
  for (var i = 0; i < parteciapnts.length; i++) {
    if (parteciapnts[i].id_utente == idUtente) {
      return parteciapnts[i];
    }
  }
}


function removePartecipant(partecipant, room) {

  if (!partecipant) return false;
  console.log("removing part" + partecipant.id_utente + "From room " + room)
  var parteciapnts = openRooms[room];
  for (var i = 0; i < parteciapnts.length; i++) {
    if (parteciapnts[i].id_utente == partecipant.id_utente) {
      parteciapnts.splice(i, 1);
      return true;
    }
  }
  console.log("-----openRooms[room]------" + room);
  console.log(openRooms[room]);
  console.log("-------------------");
}


function existsPartecipant(room, partecipant) {
  if (!openRooms[room]) return false;
  var parteciapnts = openRooms[room];
  for (var i = 0; i < parteciapnts.length; i++) {
    if (parteciapnts[i].id_utente == partecipant.id_utente) {
      return true;
    }
  }
}


/*
function existsPartecipant(room, partecipant) {

  if (!openRooms[room]) return false;

  for (var i = 0; i < openRooms[room].partecipant.length; i++) {
    if (openRooms[room].partecipant[i].id_utente == partecipant.id_utente) {
      openRooms[room].partecipant.splice(i, 1);
      return;
    }
  }
}*/



/*
const socketsStatus = {};
io.sockets.on('connection', function (socket) {
  const socketId = socket.id;
  socketsStatus[socket.id] = {};


  console.log("connect");

  socket.on("voice", function (data) {

    var newData = data.split(";");
    newData[0] = "data:audio/ogg;";
    newData = newData[0] + newData[1];

        socket.broadcast.to(id).emit("send", newData);


  });

  socket.on("userInformation", function (data) {
    socketsStatus[socketId] = data;

    io.sockets.emit("usersUpdate", socketsStatus);
  });


  socket.on("disconnect", function () {
    delete socketsStatus[socketId];
  });

});
*/





function setIdLoggato(value) {
  idLoggato = value;
}


app.get('/view', (request, response) => {


  const filePath = path.join(__dirname, 'public', "view.html");
  response.sendFile(filePath);
});






let sem = 0;

app.post('/user', async (request, response) => {


  let sessionId = request.session.id;
  if (sessioni[sessionId]) {

    console.log(sessioni[sessionId].userId);
    console.log("log with " + sessioni[sessionId].userid);
    let utente = await getUtente(sessioni[sessionId].userid);
    response.send(utente);
  } else
    response.send("" + 0);
});

function getIdByUsername(username) {
  return new Promise(function (resolve, reject) {
    var query = "Select id_utente from utenti where utente='" + username + "'";
    console.log(query);
    con.query(query, function (err, result) {
      if (err) throw err;
      resolve(JSON.parse(JSON.stringify(result)));
    });
  });
}

async function getUtente(userid) {
  return new Promise(function (resolve, reject) {
    var quer = "SELECT * FROM utenti where id_utente=" + userid;
    con.query(quer, function (err, result) {
      if (err) throw err;
      resolve(result);
    });
  });

}


app.get('/login', async (request, response) => {

  let sessionId = request.session.id;

  console.log("---session----");
  console.log(sessioni[sessionId]);


  if (sessioni[sessionId]) {

    console.log(sessioni[sessionId].userid);
    console.log("log with " + sessioni[sessionId].userid);

    let utente = await getUtente(sessioni[sessionId].userid);

    //response.send(utente);
  }


  const filePath = path.join(__dirname, 'public', "login.html");
  response.sendFile(filePath);

});

app.get('/logout', async (request, response) => {

  let sessionId = request.session.id;

  if (sessioni[sessionId]) {

    sessioni[sessionId] = undefined;
    response.sendFile("login.html", { root: __dirname });
  }
});


/*

app.use('/', async function (req, res, next) {
  
  console.log("middleware /login");
  let sessionId = req.session.id;
  if (sessioni[sessionId]) {
    let utente = await getUtente(sessioni[sessionId].userid);
    //res.append('json', utente);
  }
  next();
});
*/





app.post('/getUsers', (request, response) => {

  var utente = request.body.utente;
  /*
    let sessionId = request.session.id;
    if (!sessioni[sessionId]) return;
  */
  var quer = "SELECT * from utenti where utente like '" + utente + "%' "
  console.log(quer);
  con.query(quer, function (err, result) {
    if (err) throw err;
    response.json(result);
  });
});


app.post('/addFriend', async (request, response) => {

  var idLista = request.body.idLista;
  var nomeUtente = request.body.nomeUtente;

  /*
    let sessionId = request.session.id;
    if (!sessioni[sessionId]) return;
  */
  var msgError = {
    username: nomeUtente,
    msg: "-1"
  }

  var idUtente = await getIdByUsername(nomeUtente);
  console.log(idUtente);
  if (idUtente.length > 0) idUtente = idUtente[0].id_utente;
  else {
    console.log(idUtente);
    response.json(msgError);
    return;
  }

  var quer = "INSERT INTO `amici`(`fk_lista`, `fk_utente`) VALUES ('" + idLista + "','" + idUtente + "')";
  console.log(quer);

  con.query(quer, async function (err, result) {
    if (err) {
      console.error('err thrown: ' + err);
      response.json(msgError);
      return;
    }

    let utente = await getUtente(idUtente);


    var msg = {
      nome: utente[0].nome,
      cognome: utente[0].cognome,
      username: nomeUtente,
      idList: idLista,
      msg: "1"
    }
    console.log(msg);
    response.json(msg);

  });
});




app.post('/listeamici', (request, response) => {

  let sessionId = request.session.id;
  if (!sessioni[sessionId]) return;

  var quer = "SELECT * FROM utenti,lista where " + sessioni[sessionId].userid + "=lista.fk_utente GROUP BY lista.nomeLista";
  con.query(quer, function (err, result) {
    if (err) throw err;
    response.json(result);
  });
});


app.post('/createParty', async (request, response) => {

  var nomeParty = request.body.nomeParty;
  var id_lista = request.body.id_lista;
  var url_video = request.body.urlVideo;
  var codice_invito = request.body.codice_invito;
  var id_room;

  let sessionId = request.session.id;
  if (!sessioni[sessionId]) return;


  var myQuery1 = "INSERT INTO `room`( `nomeRoom`, `publica`, `urlVideo`, `codice_invito`) VALUES ('" + nomeParty + "','1','" + url_video + "','" + codice_invito + "')";
  console.log("create   " + myQuery1);
  let res1 = await new Promise((resolve, reject) => con.query(myQuery1, (err, results) => {
    if (err) {
      reject(err)
    } else {
      resolve(results);
    }
  }));

  id_room = res1.insertId;
  var myQuery2 = "INSERT INTO `partecipanti`( `fk_lista`, `fk_room`) VALUES (" + id_lista + ",'" + id_room + "')";
  let res2 = await new Promise((resolve, reject) => con.query(myQuery2, (err, results) => {
    if (err) {
      reject(err)
    } else {
      resolve(results);
    }
  }));

  console.log("create Party");
  console.log(res1);
  response.send("" + id_room);
});


//frined
app.post('/getFriends', async (request, response) => {
  let sessionId = request.session.id;
  if (!sessioni[sessionId]) return;
  var myQuery = "Select * from lista left join amici on lista.id_lista=amici.fk_lista left join utenti on amici.fk_utente=utenti.id_utente where lista.fk_utente=" + sessioni[sessionId].userid;
  let res = await new Promise((resolve, reject) => con.query(myQuery, (err, results) => {
    if (err) {
      reject(err)
    } else {
      resolve(results);
    }
  }));
  response.send(res);
});


//login
app.post('/login', async (request, response) => {
  var email = request.body.email;
  var password = request.body.password;
  var myQuery1 = "Select * from utenti where email='" + email + "' and password='" + password + "'";
  console.log(myQuery1);

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
          userLogged = row;
          setIdLoggato(row.id_utente);

          let sessionTmp = request.session;
          sessionTmp.userid = row.id_utente;

          let sessionId = request.session.id;
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


app.post('/signIn', async (request, response) => {
  var name = request.body.name;
  var surnamame = request.body.surnamame;
  var username = request.body.username;
  var email = request.body.email;
  var password = request.body.password;

  var respo = "";

  try {
    var myQuery1 = "INSERT INTO `utenti`(`nome`, `cognome`, `utente`, `email`, `password`) VALUES ('" + name + "','" + surnamame + "','" + username + "','" + email + "','" + password + "')";

    if (name.length < 3 || surnamame.length < 3 || surnamame.length < 3 || email.length < 3 || username.length < 3 || password.length < 3) {

      response.send(JSON.parse('{"message": "0"}'));
      return;
    }

    let res = await new Promise((resolve, reject) => con.query(myQuery1, (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results);
      }
    }))
      .then((res) => {
        if (res.affectedRows > 0) {
          response.send(JSON.parse('{"message": "1"}'));
        }
        else {
          response.send(JSON.parse('{"message": "0"}'));
        }
      })
      .catch((error) => {
        console.error("Errore" + error);
        response.send(JSON.parse('{"message": "0"}'));
      });

  } catch (error) {
    console.error("Errore" + error);
    response.send(JSON.parse('{"message": "0"}'));
  };



});



app.post('/getRoom/:idRoom', async (request, response) => {

  var idRoom = request.params;

  /*
    let sessionId = request.session.id;
    if (!sessioni[sessionId]) return;
    */
  //var myQuery1 = "SELECT * FROM `room` INNER JOIN partecipanti on room.id_room=partecipanti.fk_room where id_room="+idRoom;

  var myQuery1 = "select * from partecipanti left join amici on partecipanti.fk_lista=amici.fk_lista left join utenti on amici.fk_utente=utenti.id_utente left join room on fk_room=room.id_room INNER join lista on lista.id_lista=partecipanti.fk_lista where fk_room=" + idRoom.idRoom;

  //console.log("getRoom" + myQuery1);
  let res = await new Promise((resolve, reject) => con.query(myQuery1, (err, results) => {
    if (err) {
      reject(err)
    } else {
      resolve(results);
    }
  }))
    .then((res) => {
      response.send(res);
    })
    .catch((error) => {
      console.error("Errore" + error);
    });
});

app.post('/getRoom/:idRoom/partecipans', async (request, response) => {

  var idRoom = request.params.idRoom;
  console.log(request.params);

  /* let sessionId = request.session.id;
   if (!sessioni[sessionId]) return;*/

  var myQuery1 = "select nome,cognome,utente,id_utente from partecipanti left join amici on partecipanti.fk_lista=amici.fk_lista left join utenti on amici.fk_utente=utenti.id_utente where fk_room="+idRoom+" union select nome,cognome,utente,id_utente from room INNER join partecipanti on room.id_room=partecipanti.id_partecipa INNER join lista on lista.id_lista=partecipanti.fk_lista inner join utenti on utenti.id_utente=lista.fk_utente where fk_room="+idRoom;

  // var myQuery1 = "select * from partecipanti left join amici on partecipanti.fk_lista=amici.fk_lista left join utenti on amici.fk_utente=utenti.id_utente where fk_room=" + idRoom.idRoom;

  console.log("getPartecipans " + myQuery1);
  let res = await new Promise((resolve, reject) => con.query(myQuery1, (err, results) => {
    if (err) {
      reject(err)
    } else {
      resolve(results);
    }
  }))
    .then((res) => {
      response.send(res);
    })
    .catch((error) => {
      console.error("Errore" + error);
    });
});


app.post('/newUrl', async (request, response) => {
  var idCurrentRoom = request.body.idCurrentRoom;
  var newUrl = request.body.newUrl;

  var myQuery1 = "UPDATE `room` SET `urlVideo`='" + newUrl + "' WHERE id_room=" + idCurrentRoom;
  console.log("" + myQuery1);

  let res = await new Promise((resolve, reject) => con.query(myQuery1, (err, results) => {
    if (err) {
      reject(err)
    } else {
      resolve(results);
    }
  }))
    .then((res) => {

      response.send(res);
    })
    .catch((error) => {
      console.error("Errore" + error);
    });
});




app.post('/visitableRooms', async (request, response) => {

  let sessionId = request.session.id;
  if (!sessioni[sessionId]) return;

  // var myQuery1 = "SELECT * FROM room inner join partecipanti on room.id_room=partecipanti.fk_room inner join lista on partecipanti.fk_lista=lista.id_lista inner join amici on amici.fk_lista=lista.id_lista where lista.fk_utente=" + sessioni[sessionId].userid;
  //var myQuery1 ="SELECT * FROM room inner join partecipanti on room.id_room=partecipanti.fk_room inner join lista on partecipanti.fk_lista=lista.id_lista inner join amici on lista.id_lista=amici.fk_lista where amici.fk_utente="+sessioni[sessionId].userid;
  var myQuery1 = "SELECT * FROM room inner join partecipanti on room.id_room=partecipanti.fk_room inner join lista on partecipanti.fk_lista=lista.id_lista inner join amici on lista.id_lista=amici.fk_lista where amici.fk_utente=" + sessioni[sessionId].userid + " UNION SELECT * FROM room inner join partecipanti on room.id_room=partecipanti.fk_room inner join lista on partecipanti.fk_lista=lista.id_lista left join amici on lista.id_lista=amici.fk_lista where lista.fk_utente=" + sessioni[sessionId].userid + " Group by id_room;";
  console.log(myQuery1);

  let res = await new Promise((resolve, reject) => con.query(myQuery1, (err, results) => {
    if (err) {
      reject(err)
    } else {
      resolve(results);
    }
  }))
    .then((res) => {

      response.send(res);
    })
    .catch((error) => {
      console.error("Errore" + error);
    });
});


app.post('/invitatioLink', async (request, response) => {

  var invitationLink = request.body.invitationLink;

  let sessionId = request.session.id;
  if (!sessioni[sessionId]) return;

  var myQuery1 = "SELECT * FROM room where codice_invito='" + invitationLink + "'";

  console.log(myQuery1);

  let res = await new Promise((resolve, reject) => con.query(myQuery1, (err, results) => {
    if (err) {
      reject(err)
    } else {
      resolve(results);
    }
  }))
    .then((res) => {

      response.send(res);
    })
    .catch((error) => {
      console.error("Errore" + error);
    });
});

app.post('/newList', async (request, response) => {

  var listName = request.body.listName;

  let sessionId = request.session.id;
  if (!sessioni[sessionId]) return;

  var myQuery1 = "INSERT INTO `lista`(`nomeLista`, `fk_utente`) VALUES ('" + listName + "','" + sessioni[sessionId].userid + "')";

  console.log(myQuery1);

  let res = await new Promise((resolve, reject) => con.query(myQuery1, (err, results) => {
    if (err) {
      reject(err)
    } else {
      resolve(results);
    }
  }))
    .then((res) => {
      response.send(res);
    })
    .catch((error) => {
      console.error("Errore" + error);
    });
});



app.post('/logOut', async (request, response) => {
  let sessionId = request.session.id;
  sessioni[sessionId] = null;
});

app.post('/removeFriend', async (request, response) => {

  var username = request.body.username;
  var idList = request.body.idList;

  var idUtente = await getIdByUsername(username);
  idUtente = idUtente[0].id_utente;

  var quer = "DELETE FROM `amici` WHERE fk_lista=" + idList + " and fk_utente=" + idUtente;
  console.log(quer);

  con.query(quer, function (err, result) {
    if (err) {
      console.error('err thrown: ' + err);
      var msg = {
        msg: "false"
      }
      response.json(msg);
    }

    var msg = {
      msg: "true"
    }
    response.json(msg);
  });

});






