const Config = require('./utils/Config');

class DatabaseManager {

    /**
     * This function analyses the passed database and check if it is valid. if no : create the database
     * @param sql - a sqlite file.
     */
    checkDatabaseValidity(sql) {
        console.log('Checking Database ...');
        sql.get(`SELECT version FROM database`).catch(() => {
            this.createDatabase(sql);
        }).then(() => {
            console.log('... Database is valid !');
        })
    }

    /**
     * This function create the database
     * @param sql - a sqlite file.
     */
    createDatabase(sql) {
        console.log("... Database is not valid !\nDatabase Generation ...");

        //table entity
        sql.run("CREATE TABLE IF NOT EXISTS entity (id TEXT, maxHealth INTEGER, health INTEGER, attack INTEGER, defense INTEGER, speed INTEGER, effect TEXT)").catch(console.error);
        //table player
        sql.run("CREATE TABLE IF NOT EXISTS player (discordId TEXT, score INTEGER, level INTEGER, experience INTEGER, money INTEGER, lastReport INTEGER, badges TEXT)").catch(console.error);
        //table server
        sql.run("CREATE TABLE IF NOT EXISTS server (id TEXT, prefix TEXT, language TEXT)").catch(console.error);
        //table inventory
        sql.run("CREATE TABLE IF NOT EXISTS inventory (playerId TEXT, weaponId TEXT, armorId TEXT, potionId TEXT, objectId TEXT, backupItemId TEXT)").catch(console.error);

        //table only used to store the version of the bot when the database was created
        sql.run("CREATE TABLE IF NOT EXISTS database (version TEXT)").then(() => {
            sql.run(`INSERT INTO database (version) VALUES (\"${Config.version}\")`).then(() => {
                console.log("... Generation Complete !");
            });
        });

    }
}

module.exports = DatabaseManager;