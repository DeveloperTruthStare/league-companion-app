import sqlite3 from "sqlite3";
import { open, Database } from 'sqlite';
import path from "path";

const dbPath = path.join(__dirname, "database.sqlite");
let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function initDB() {
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });
    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        puuid TEXT PRIMARY KEY,
        gameName TEXT NOT NULL,
        tagLine TEXT NOT NULL
    );
`);

await db.exec(`
    CREATE TABLE IF NOT EXISTS matchHistory (
        matchId TEXT NOT NULL,
        playerPuuid TEXT NOT NULL,
        matchInfo TEXT NOT NULL,
        queueId INTEGER NOT NULL,
        timeEnded INTEGER NOT NULL
    );
`);
}

export async function insertUser(puuid: string, gameName: string, tagLine: string) {
    await db.run("INSERT INTO users (puuid, gameName, tagLine) VALUES (?, ?, ?);",
        [puuid, gameName, tagLine]);
    return getUserByPuuid(puuid);
}

export async function getUsers() {
    return await db.get('SELECT * FROM users;');
}

export async function getUserByPuuid(puuid: string) {
    return await db.get("SELECT * FROM users WHERE puuid = ? LIMIT 1;", [puuid]);
}

export async function getUserByName(gameName: string, tagLine: string) {
    return await db.get("SELECT * FROM users WHERE gameName = ? AND tagLine = ? LIMIT 1;", [gameName, tagLine]);
}

export async function insertMatchHistory(matchId: string, playerPuuid: string, matchInfo: string, queueId: number, timeEnded: number) {
    await db.run("INSERT INTO matchHistory (matchId, playerPuuid, matchInfo, queueId, timeEnded) VALUES (?, ?, ?, ?, ?);", [matchId, playerPuuid, matchInfo, queueId, timeEnded]);
}

export async function getMatchHistory(puuid: string): Promise<MatchDto[]> {
    const rows = await db.all("SELECT matchInfo FROM matchHistory WHERE playerPuuid = ? ORDER BY timeEnded DESC", [puuid]);
    return rows.map(row => JSON.parse(row.matchInfo));
}

export async function closeDB() {
    if (db) {
        await db.close();
    }
    console.log("Database conection closed.");
}