var mysql = require('mysql');
const fs = require('fs');
var resolve = require('path');
var jsonPath = resolve.join(__dirname, '..', 'connection', 'dbConfig.json')
var structurePath = resolve.join(__dirname, '..', 'connection', 'file.sql')
let rawdata = fs.readFileSync(jsonPath);

let connectionData = JSON.parse(rawdata);

var con = mysql.createConnection(connectionData);

const DATABASENAME = connectionData.databasename;


con.query('CREATE DATABASE IF NOT EXISTS ' + DATABASENAME, (error, results) => {

    console.log(results);
    if (error) {
        console.log('Error creating database: ' + error);
    } else {
        if (results.affectedRows > 0) {
            console.log("creo database");

            con.query('USE ' + DATABASENAME, function (error, results, fields) {
                if (error) throw error;
                console.log('Database selected');
            })

            createStructure();
            connectionData.database = DATABASENAME;

        }
        con.query('USE ' + DATABASENAME, function (error, results, fields) {
            if (error) throw error;
            console.log('Database selected');
        })
    }
});



function use() {
    con.query('USE ' + DATABASENAME, function (error, results, fields) {
        if (error) throw error;
        console.log('Database selected');
    });

}

/*

con.changeUser({ database: DATABASENAME }, (err) => {
    if (err) throw err;
    console.log("Il database selezionato è: " + con.config.database);
    connectionData.database = DATABASENAME;
    console.log(connectionData);

});*/



function createStructure() {
    fs.readFile(structurePath, 'utf8', (err, data) => {
        if (err) throw err;
        con.query(data, (error, results) => {
            if (error) throw error;
        });
    });

}


module.exports = mysql.createPool(connectionData);


/*
module.exports = new Promise(function (resolve, reject)
con.connect(function (err) {
    if (err) throw err;
    console.log("Successfully connected to the database.");
});
resolve(con);
)*/