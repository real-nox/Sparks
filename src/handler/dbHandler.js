import { createClient } from "@supabase/supabase-js"
import color from "colors"

const URI = process.env.uri

export const DB = createClient(URI, process.env.privatekey)

export async function LoadDB() {
    const { error } = await DB.from("guilds").select("*").limit(1)
    
    if (error) return console.log(color.bgRed("[DB] Couldn't connect to the database!"))

    return console.log(color.bgGreen("[DB] Connected to the database."))
}