const { Print } = require("../handler/extraHandler");
const { ErrorLog } = require("../handler/logsHanlder");

const RGL_games =
    `create table if not exists RGL_games(
    gameID int auto_increment primary key,
    guildID varchar(250) NOT NULL,
    channelID varchar(250) NOT NULL,
    ongoing boolean default false
)`;

const RGL_T =
    `create table if not exists RGL_T(
	gameID int,
    guildID varchar(250) NOT NULL,
    winners varchar(250) default 0 NOT NULL,
    constraint fk_gameID foreign key (gameID) references RGL_games(gameID)
)`;

async function gameRStart(data, guildID, channelID) {
    try {
        const ongame = await getRGameOngoing(data, guildID, channelID);

        if (ongame.length == 0) return false;

        const [starting] = await data.promise().query(
            `Insert into rgl_games (guildID, channelID, ongoing) values (?,?,?)`,
            [guildID, channelID, true]
        );

        if (starting) return true;
        return false;

    } catch (err) {
        Print("[RGLDB] " + err, "Red");
        ErrorLog("RGLDB", err);
    }
}

async function gameREnd(data, guildID, channelID) {
    try {
        if (!(guildID && channelID)) return null;

        let ongame = await getRGameOngoing(data, guildID, channelID);

        if (ongame.length > 0) {

            let [thegame] = await data.promise().query(
                `update rgl_games set ongoing = false where (guildID=? && channelID=? && ongoing = true)`,
                [guildID, channelID]
            );

            if (thegame) return true;
            return false;
        }
    } catch (err) {
        Print("[RGLDB] " + err, "Red");
        ErrorLog("RGLDB", err);
    }
}

async function saveRWinners(data, guildID, channelID, winnerID) {
    try {
        let [ongame] = await getRGameOngoing(data, guildID, channelID);

        if (ongame) {
            let [resultat] = await data.promise().query(
                `insert into rgl_t values(?,?,?)`,
                [ongame.gameID, guildID, winnerID]
            )

            if (!resultat) return false;
            return true;
        }
    } catch (err) {
        Print("[RGLDB] " + err, "Red");
        ErrorLog("RGLDB", err);
    }
}

async function getRGameOngoing(data, guildID, channelID) {
    try {
        if (!(guildID && channelID)) return null;

        let [resultat] = await data.promise().query(
            `select * from rgl_games where (guildID=? && channelID=? && ongoing = true)`,
            [guildID, channelID]
        );

        if (resultat.length == 0) return false;
        return resultat;
    } catch (err) {
        Print("[RGLDB] " + err, "Red");
        ErrorLog("RGLDB", err);
    }
}

async function deleteRGL(data, guildID, channelID) {
    try {
        if (!(guildID && channelID)) return null;

        const [ongame] = await getRGameOngoing(data, guildID, channelID);

        if (!ongame) return false;
        let [deletion] = await data.promise().query(
            `delete from rgl_games where gameID = ?`,
            [ongame.gameID]
        );

        if (!deletion) return false;
        return true;
    } catch (err) {
        Print("[RGLDB] " + err, "Red");
        ErrorLog("RGLDB", err);
    }
}

module.exports = { RGL_games, RGL_T, gameRStart, saveRWinners, gameREnd, getRGameOngoing, deleteRGL }