const { Print } = require("../handler/extraHandler");
const { ErrorLog } = require("../handler/logsHanlder");

const SERVERT =
    `create table if not exists serverT(
    guildID varchar(250) Primary key,
    staffRID varchar(250) default null,
    prefix varchar(5) default '!' 
)`;

async function setGuild(DB, guildID) {
    try {
        let [res] = await DB.promise().query(
            `insert into serverT (guildID) values (?)`, [guildID]
        );

        if (res) return true;
        return false;
    } catch (err) {
        Print("[SERVERDB] " + err, "Red");
        ErrorLog("SERVERDB", err);
    }
}

async function getGuild(DB, guildID) {
    try {
        let [res] = await DB.promise().query(
            `select * from serverT where guildID = ${guildID}`
        );
        
        if(!res) return false
        return res;
    } catch (err) {
        Print("[SERVERDB] " + err, "Red");
        ErrorLog("SERVERDB", err);
    }
}

//Prefix change
async function getPrefix(DB, guildID) {
    try {
        await getGuild(DB, guildID)

        let [result] = await DB.promise().query(
            `select prefix from serverT where guildID = ${guildID}`
        );

        if (!result) return false;
        return result;
    } catch (err) {
        Print("[SERVERDB] " + err, "Red");
        ErrorLog("SERVERDB", err);
    }
}

async function setPrefix(DB, guildID, prefix) {
    try {
        await getGuild(DB, guildID)

        let [Updated] = await DB.promise().query(
            `Update serverT set prefix = ? where guildID = ?`,
            [prefix, guildID]
        );

        if (!Updated) return false;
        return true;
    } catch (err) {
        Print("[SERVERDB] " + err, "Red");
        ErrorLog("SERVERDB", err);
    }
}

//Staff
async function getStaffR(DB, guildID) {
    try {
        await getGuild(DB, guildID)

        let [result] = await DB.promise().query(
            `select staffRID from serverT where guildID = ${guildID}`
        );

        if (!result) return false;
        return result;
    } catch (err) {
        Print("[SERVERDB] " + err, "Red");
        ErrorLog("SERVERDB", err);
    }
}

async function setStaffR(DB, guildID, staffRID) {
    try {
        await getGuild(DB, guildID)

        let [Updated] = await DB.promise().query(
            `Update serverT set staffRID = ? where guildID = ?`,
            [staffRID, guildID]
        );

        if (!Updated) return false;
        return true;
    } catch (err) {
        Print("[SERVERDB] " + err, "Red");
        ErrorLog("SERVERDB", err);
    }
}

module.exports = { SERVERT, setGuild, getGuild, getPrefix, setPrefix, setStaffR, getStaffR }