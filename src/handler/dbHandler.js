const { config } = require("dotenv");
const { createConnection } = require("mysql2")
const { Print } = require("./extraHandler");
const { RGL_T, RGL_games } = require("../data/RGLDB");
const { ErrorLog } = require("./logsHanlder");
const { SERVERT } = require("../data/ServerDB");
config({ quiet: true });

let DB = createConnection({
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
            if (!res) Print("[RGLDB] " + err, "Red");
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
}

module.exports = { LoaddDB, DB }