const { config } = require("dotenv"); config({ quiet: true });
const { Print } = require("./extraHandler");
const mongoose = require("mongoose");

async function LoadDB() {
    let res;
    await mongoose.connect(process.env.uri)
        .then(() => {
            Print("[DATABASE] Connected to the MongoDB database!", "Cyan");
            res = true;
        })
        .catch((error) => {
            Print("[ERROR] " + error, "Red");
            res = false;
        })

    if (!res)
        return await LoadDB();
}






























/*let DB = createConnection({
    host: process.env.host,
    user: process.env.user,
    port: process.env.port,
    database: process.env.database,
    password: process.env.password,
});

async function LoaddDB() {
    try {

        DB.connect(function (err) {
            if (err) throw err;
            Print("[DATABASE] Connected to the MySQL database!", "Cyan")
        });

        await LoadTables(DB);
        return DB;
    } catch (error) {
        Print("[ERROR] " + error, "Red");
        ErrorLog("DATABASE", error);
    }
}

async function LoadTables(DB) {
    try {
        await DB.promise().query(SERVERT).then((res) => {
            if (!res) Print("[ServerDB] " + err, "Red");
        });
        await DB.promise().query(EconomyT).then((res) => {
            if (!res) Print("[EcoDB] " + err, "Red");
        });
        await DB.promise().query(RGL_games).then((res) => {
            if (!res) Print("[RGLDB] " + err, "Red");
        });
        await DB.promise().query(RGL_T).then((res) => {
            if (!res) Print("[RGLDB] " + err, "Red");
        });
    } catch (err) {
        Print("[RGLDB] " + err, "Red");
        ErrorLog("RGLDB", err);
    }
}*/

module.exports = { LoadDB }