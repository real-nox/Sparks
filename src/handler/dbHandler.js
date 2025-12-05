const { MongoClient, ServerApiVersion, Db } = require("mongodb")
const {config} = require("dotenv"); config({quiet : true})

const URI = process.env.URIDB
const DB = new MongoClient(URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})

async function DBHandler() {
    try {
        await DB.connect()
        await DB.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } catch (err) {
        console.error("[ERROR] ", err)

    } finally {
    }
}

module.exports = {DBHandler, DB}