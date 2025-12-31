const { Print, ErrorLog } = require("../handler/extraHandler");

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
    participantsID varchar(250) NOT NULL,
    winners varchar(250) default 0 NOT NULL,
    defeated varchar(250) default 0 NOT NULL,
    constraint fk_gameID foreign key (gameID) references RGL_games(gameID)
)`;

async function LoadRGL(DB) {
    try {
        await DB.promise().query(RGL_games).then((res) => {
            if (!res) return print("[ERROR]");
        });
        await DB.promise().query(RGL_T).then((res) => {
            if (!res) return print("[ERROR]");
        });
    } catch (err) {
        Print("[RGLDB] " + err, "Red");
        ErrorLog("RGLDB", err);
    }
}

async function gameStart(data, guildID, channelID) {
    try {
        await data.promise().query(`select ongoing from rgl_games where (guildid =? && channelid=? && ongoing=true)`, [guildID, channelID,])
            .then(async (resu) => {
                if (resu[0].length == 0) {
                    await data.promise().query(`Insert into rgl_games (guildID, channelID, ongoing) values (?,?,?)`,
                        [guildID, channelID, true])
                        .then((res) => {
                            if (res) console.log(res)
                        })
                } else {
                    console.log("there is an ongoing game")
                }
            })
    } catch (err) {
        Print("[RGLDB] " + err, "Red");
        ErrorLog("RGLDB", err);
    }
}

async function gameEnd(data, guildID, channelID) {
    try {
        const [ongame] = await data.promise().query(
            `select ongoing from rgl_games where (guildid =? && channelid=? && ongoing=true)`,
            [guildID, channelID,]
        );

        if (ongame.length == 0) return console.log("there is no an ongoing game");

        const [thegame] = await data.promise().query(
            `delete from rgl_games where (guildID=? && channelID=? && ongoing = true)`,
            [guildID, channelID,]
        );

        if (thegame) {
            return true;
        } else {
            return false
        }
    } catch (err) {
        Print("[RGLDB] " + err, "Red");
        ErrorLog("RGLDB", err);
    }
}

async function getGameBYID(data, ID) {
    try {
        if (!ID) return null;

        await data.promise().query(`select * from rgl_games where gameid=${ID}`).then(res => {
            if (res[0].length == 0) return false;
        })
    } catch (err) {
        Print("[RGLDB] " + err, "Red");
        ErrorLog("RGLDB", err);
    }
}

module.exports = { LoadRGL, gameStart, gameEnd, getGameBYID }