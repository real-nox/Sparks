import { config } from "dotenv"; config({ quiet: true });

import { REST, Routes } from "discord.js";
import { Print } from "./extraHandler.js";
import { ErrorLog } from "../systems/LogSystem.js";

import path from "path";
import fs from "fs";

const cmds = [];
const prefixs = [];

import asciiTable from "ascii-table";
import { fileURLToPath, pathToFileURL } from "url";

const cmdTable = new asciiTable("Commands");
cmdTable.setHeading("Name", "Type", "Execute", "Category");

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export async function commandHandler(client) {
    try {
        const CMDFolder = path.join(__dirname, "../cmd/slash");
        const PREFolder = path.join(__dirname, "../cmd/prefix");

        const preFolders = fs.readdirSync(PREFolder)
        const cmdFolders = fs.readdirSync(CMDFolder)

        for (const folder of cmdFolders) {
            let cmdFiles = fs.readdirSync(path.join(__dirname, `../cmd/slash/${folder}`));
            for (const file of cmdFiles) {
                try {
                    const filepath = path.join(`${CMDFolder}/${folder}`, file);

                    const module_cmd = await import(pathToFileURL(filepath).href);
                    const cmd = module_cmd.default ?? module_cmd

                    if ('data' in cmd && 'execute' in cmd) {
                        client.commands.set(cmd.data.name, cmd);
                        cmds.push(cmd.data.toJSON());
                        cmdTable.addRow(file, "Slash", "Loaded", folder);
                    } else {
                        cmdTable.addRow(file, "Slash", "Unloaded", folder);
                    }
                } catch (error) {
                    Print("[COMMANDS Files] " + error, "Red");
                    ErrorLog("COMMANDS", error);
                }
            }
        }

        client.application.commands.set(cmds);

        for (const folder of preFolders) {

            let preFiles = fs.readdirSync(path.join(__dirname, `../cmd/prefix/${folder}`));
            for (const file of preFiles) {
                try {
                    const filepath = path.join(`${PREFolder}/${folder}`, file);

                    const module_pre = await import(pathToFileURL(filepath).href);
                    const pre = module_pre.default ?? module_pre

                    if (pre.prerun || pre.name) {
                        client.prefixs.set(pre.name, pre);
                        prefixs.push(pre.name);
                        cmdTable.addRow(file, "Prefix", "Loaded", folder);
                    } else {
                        cmdTable.addRow(file, "Prefix", "Unloaded", folder);
                    }
                } catch (error) {
                    Print("[COMMANDS Files] " + error, "Red");
                    ErrorLog("COMMANDS", error);
                }
            }
        }

        Print(cmdTable.toString(), "Blue");

        const rest = new REST().setToken(process.env.TOKEN);
        (async () => {
            try {
                Print(`> Started refreshing ${cmds.length} application (/) commands.`, "Yellow");
                const data = await rest.put(Routes.applicationCommands(client.user.id), { body: cmds });
                Print(`> Successfully reloaded ${data.length} application (/) commands.`, "Green");
            } catch (error) {
                Print("[COMMANDS Files] " + error, "Red");
                ErrorLog("COMMANDS", error);
            }
        })()
    } catch (error) {
        Print("[COMMANDS] " + error, "Red");
        ErrorLog("COMMANDS", error);
    }
}