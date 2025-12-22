const { config } = require("dotenv");
const oracledb = require("oracledb");
const { ErrorLog, Print } = require("./extraHandler");
const { EconomyCreateT } = require("../data/Tables");
config({ quiet: true });

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let DB;

async function LoaddDB() {
    try {
        oracledb.initOracleClient({
            libDir: "C:\\Users\\rayan\\Downloads\\instantclient-basic-windows.x64-19.29.0.0.0dbru\\instantclient_19_29"
        });

        await oracledb.createPool({
            user: process.env.user,
            password: process.env.password,
            connectString: process.env.connectString
        });

        DB = await oracledb.getConnection();

        if (!DB) {
            Print("[DATABASE] : Database didn\'t load correctly!", "Red");
            return ErrorLog("DATABASE", "Database didn\'t load correctly!");
        }

        Print("[DATABASE] : Database loaded", "Yellow");

        DB;
        await EconomyCreateT(DB);
    } catch (error) {
        Print("[ERROR] " + error, "Red");
        ErrorLog("DATABASE", error);
    }
}

module.exports = { LoaddDB }