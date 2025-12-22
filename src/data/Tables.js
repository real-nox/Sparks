const { Print, ErrorLog } = require("../handler/extraHandler")

const EconomyTable = `
    create table ECO(
    user_id Integer NOT NULL Unique,
    guild_id Integer Primary key,
    ballance Number(6, 2)
   )`;

async function EconomyCreateT(DB) {
    try {
        await DB.execute(EconomyTable, (err, res) => {
            if (err) {
                Print("[TABLE] : Error creating table: " + err, "Red");
                ErrorLog("Table", err)
            } else {
                Print("[TABLE] : Eco table ensured to exist (created or already present).", "Yellow");
            }
        })
    } catch (err) {
        Print("[TABLE] " + err, "Red");
        ErrorLog("Table", err);
    }
}

module.exports = { EconomyCreateT }