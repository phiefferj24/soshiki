import Database from "soshiki-database";

let database: Database;

export default async () => { 
    if (typeof database === "undefined") {
        database = await Database.connect();
    }
    return database;
}