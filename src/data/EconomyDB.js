const { Print } = require("../handler/extraHandler");
const { ErrorLog } = require("../handler/logsHanlder");

const EconomyT = `create table if not exists EconomyT(
    userID varchar(250),
    guildID varchar(250),
    balance int default 0,
    earnc bigint,
    dailyc bigint,
    primary key (userID, guildID)
)`;

//Balance
async function getBalC(DB, userID, guildID) {
    try {
        let [res] = await DB.promise().query(
            `select balance, earnc, dailyc from economyT where userid = ? and guildid = ?`,
            [userID, guildID]
        );

        if (!res || res.length === 0) {
            return false;
        }

        const {
            balance = 0,
            earnc = 0,
            dailyc = 0,
        } = res[0];

        return { balance, earnc, dailyc };
    } catch (error) {
        Print("[Getbal]", error, "Red");
        ErrorLog("Getbal", error);
    }
}

//Earn Sparks
async function Earns(DB, userID, guildID, bal, cooldown, found) {
    try {
        let res;

        if (!found) {
            return [res] = await DB.promise().query(
                `insert into economyt (userid, guildid, balance, earnc) values (?,?,?,?)`,
                [userID, guildID, bal, cooldown]
            );
        };

        return [res] = await DB.promise().query(
            `update economyt set balance = ?, earnc = ? where (userid = ? and guildid = ?)`,
            [bal, cooldown, userID, guildID]
        );

    } catch (error) {
        Print("[EARNCDB] " + error, "Red");
        ErrorLog("EARNCDB", error);
    }
}

//Daily Sparks
async function Dailys(DB, userID, guildID, bal, cooldown, found) {
    try {
        let res;

        if (!found) {
            return [res] = await DB.promise().query(
                `insert into EconomyT (userid, guildid, balance, dailyc) values (?,?,?,?)`,
                [userID, guildID, bal, cooldown]
            );
        }

        return [res] = await DB.promise().query(
            `update economyT set balance = ?, dailyc = ? where (userID = ? and guildid = ?)`,
            [bal, cooldown, userID, guildID]
        );
    } catch (error) {
        Print("[DAILYSDB] " + error, "Red");
        ErrorLog("DAILYSDB", error);
    }
}

module.exports = { EconomyT, getBalC, Earns, Dailys }