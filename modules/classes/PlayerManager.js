const Player = require('./Player');
const DefaultValues = require('../utils/DefaultValues')
const Config = require('../utils/Config')
const sql = require("sqlite");
const Text = require('../text/Francais');
const Tools = require('../utils/Tools');
const InventoryManager = require('../classes/InventoryManager');
const EquipementManager = require('../classes/EquipementManager');
const PotionManager = require('../classes/PotionManager');
const ObjectManager = require('../classes/ObjectManager');

sql.open("./modules/data/database.sqlite");

class PlayerManager {


    /**
    * Return a promise that will contain the player that sent a message once it has been resolved
    * @param message - The message that caused the function to be called. Used to retrieve the author of the message
    * @returns {promise} - The promise that will be resolved into a player
    */
    getCurrentPlayer(message) {
        return sql.get(`SELECT * FROM entity JOIN player on entity.id = player.discordId WHERE discordId ="${message.author.id}"`).then(player => {
            if (!player) { //player is not in the database
                console.log(`Utilisateur inconnu : ${message.author.username}`);
                return this.getNewPlayer(message);
            } else { //player is in the database
                console.log(`Utilisateur reconnu : ${message.author.username}`);
                return new Player(player.maxHealth, player.health, player.attack, player.defense, player.speed, player.discordId, player.score, player.level, player.experience, player.money, player.effect, player.lastReport)
            }
        }).catch(error => { //there is no database
            console.error(error)
            return false;
        })
    }


    /**
     * Return a promise that will contain the player that sent a message once it has been resolved
     * @param id - The id of the user 
     * @returns {promise} - The promise that will be resolved into a player
     */
    getPlayerById(id) {
        return sql.get(`SELECT * FROM entity JOIN player on entity.id = player.discordId WHERE discordId ="${id}"`).then(player => {
            if (!player) { //player is not in the database
                console.log(`Utilisateur inconnu : ${id}`);
                return this.getNewPlayerById(id);
            } else { //player is in the database
                console.log(`Utilisateur reconnu : ${id}`);
                return new Player(player.maxHealth, player.health, player.attack, player.defense, player.speed, player.discordId, player.score, player.level, player.experience, player.money, player.effect, player.lastReport)
            }
        }).catch(error => { //there is no database
            console.error(error)
            return false;
        })
    }


    /**
     * Return a player created from the defaul values
     * @param message - The message that caused the function to be called. Used to retrieve the author of the message
     * @returns {*} - A new player
     */
    getNewPlayer(message) {
        console.log('Generating a new player...');
        return new Player(DefaultValues.entity.maxHealth, DefaultValues.entity.health, DefaultValues.entity.attack, DefaultValues.entity.defense, DefaultValues.entity.speed, message.author.id, DefaultValues.player.score, DefaultValues.player.level, DefaultValues.player.experience, DefaultValues.player.money, DefaultValues.entity.effect, message.createdTimestamp, DefaultValues.player.badges);
    }


    /**
     * Return a player created from the defaul values
     * @param id - The id of the player that has to be created
     * @returns {*} - A new player
     */
    getNewPlayerById(message) {
        console.log('Generating a new player...');
        return new Player(DefaultValues.entity.maxHealth, DefaultValues.entity.health, DefaultValues.entity.attack, DefaultValues.entity.defense, DefaultValues.entity.speed, id, DefaultValues.player.score, DefaultValues.player.level, DefaultValues.player.experience, DefaultValues.player.money, DefaultValues.entity.effect, message.createdTimestamp, DefaultValues.player.badges);
    }


    /**
     * Allow to revive a player and save its new state in the database
     * @param {*} player - The player that has to be revived
     * @param {Number} time - The timecode of the date of revive
     * @returns {Number} - The amount of points the player loosed during the revive process
     */
    revivePlayer(player, time) {
        let scoreRomoved = Math.round(player.getScore() * Config.PART_OF_SCORE_REMOVED_DURING_RESPAWN);

        player.setEffect(":smiley:");
        player.heal();
        player.updateLastReport(time);
        player.removeScore(scoreRomoved);

        this.updatePlayer(player);

        return scoreRomoved;
    }


    /**
     * Allow to set the state of a player to occupied in order to ensure he dont cheat
     * @param {*} player - The player that has to be saved
     */
    setPlayerAsOccupied(player) {
        console.log("Updating player ...");
        sql.run(`UPDATE entity SET effect = ":clock10:" WHERE id = ${player.discordId}`).catch(console.error);
        console.log("Player updated !");
    }


    /**
     * Allow to save the current state of a player in the database
     * @param {*} player - The player that has to be saved
     */
    updatePlayer(player) {
        console.log("Updating player ...");
        sql.run(`UPDATE entity SET maxHealth = ${player.maxHealth}, health = ${player.health}, attack = ${player.attack}, defense = ${player.defense}, speed = ${player.speed}, effect = "${player.effect}" WHERE id = ${player.discordId}`).catch(console.error);
        sql.run(`UPDATE player SET score = ${player.score}, level = ${player.level}, experience = ${player.experience}, money = ${player.money}, lastReport = ${player.lastReport}, badges = "${player.badges}" WHERE discordId = ${player.discordId}`).catch(console.error);
        console.log("Player updated !");
    }

    /**
     * Allow to save a new player in the database
     * @param {*} player - The player that has to be saved
     */
    addPlayer(player) {
        console.log("Creating player ...");
        sql.run(`INSERT INTO entity (maxHealth, health, attack, defense, speed, id, effect) VALUES ( ${player.maxHealth}, ${player.health}, ${player.attack} , ${player.defense} , ${player.speed} , ${player.discordId},"${player.effect}")`).catch(console.error);
        sql.run(`INSERT INTO player (discordId, score, level, experience, money, lastReport, badges) VALUES (${player.discordId},${player.score},${player.level},${player.experience},${player.money}, ${player.lastReport}, "${player.badges}") `).catch(console.error);
        console.log("Player created !");
    }


    //TODO
    getRank(player) {
        return 1;
        //TODO
    }

    //TODO
    getNumberOfPlayer() {
        return 1;
        //TODO
    }

    /**
     * check if the player is healthy or not. if the player is sick, display an error message
     * @param {*} message - The message that caused the function to be called. Used to retrieve the createdTimestamp
     * @param {*} player - The player that has to be tested
     * @param {String} allowedStates - A string containig the allowed states
     * @returns {boolean} - True is the player is in good health
     */
    checkState(player, message, allowedStates) {
        let result = false;
        let rejectMessage;
        if (allowedStates.includes(player.getEffect())) {
            result = true; // le joueur est dans un état authorisé
        } else {
            if (player.getEffect() != ":clock10:" && message.createdTimestamp > player.lastReport) {
                result = true;
            } else {
                rejectMessage = player.getEffect() + Text.playerManager.intro + message.author.username + Text.playerManager.errorMain[player.getEffect()];
                if (message.createdTimestamp < player.lastReport)
                    rejectMessage += this.displayTimeLeft(player, message)
                message.channel.send(rejectMessage);
            }
        }
        return result
    }


    /**
     * display the time a player have before beeing able to play again
     * @param {*} player - The player that has to be tested
     * @param {*} message - The message that caused the function to be called. Used to retrieve the createdTimestamp
     * @returns {String} - A string vontaining the duration
     */
    displayTimeLeft(player, message) {
        if (!":baby::smiley::clock10:".includes(player.getEffect())) { //these states dont have a duration to display
            if (message.createdTimestamp < player.lastReport) {
                return Text.playerManager.timeLeft + Tools.displayDuration(Tools.convertMillisecondsInMinutes(player.lastReport - message.createdTimestamp)) + Text.playerManager.outro;
            } else {
                return Text.playerManager.noTimeLeft;
            }
        } else {
            return "";
        }
    }

    /**
     * give to the player that send the message a random item
     * @param {*} message - The message that caused the function to be called. Used to retrieve the author
     * @param {*} player - The player that is playing
     */
    async giveRandomItem(message, player) {
        let inventoryManager = new InventoryManager();
        let equipementManager = new EquipementManager();
        let potionManager = new PotionManager();
        let objectManager = new ObjectManager();
        let inventory = await inventoryManager.getCurrentInventory(message);
        let type = this.chooseARandomItemType();
        switch (type) {
            case "weapon":
                player = await this.giveRandomWeapon(equipementManager, inventory, message, inventoryManager, player);
                break;
            case "armor":
                player = await this.giveRandomArmor(equipementManager, inventory, message, inventoryManager, player);
                break;
            default:
                message.channel.send("item à donner de type :" + type);
                break;
        }
        return player
    }


    /**
     * add a random armor into an inventory and save the result
     * @param {*} equipementManager - The equipement manager class
     * @param {*} inventory - the inventory of the player
     * @param {*} message - The message that caused the function to be called. Used to retrieve the author
     * @param {*} inventoryManager - The inventory manager class
     * @param {*} player - The player that is playing
     */
    async giveRandomArmor(equipementManager, inventory, message, inventoryManager, player) {
        let armor = await equipementManager.generateRandomArmor();
        let neww = equipementManager.getEquipementEfficiency(armor);
        let old = equipementManager.getEquipementEfficiency(equipementManager.getArmorById(inventory.armorId));
        console.log(neww + "/" + old);
        console.log(neww > old);
        if (neww > old) {
            inventory.armorId = armor.id;
            message.channel.send(Text.playerManager.newItem + equipementManager.displayArmor(armor));
            inventoryManager.updateInventory(inventory);
        }
        else {
            player = this.sellEquipement(player, armor, message);
        }
        return player
    }


    /**
     * add a random armor into an inventory and save the result
     * @param {*} equipementManager - The equipement manager class
     * @param {*} inventory - the inventory of the player
     * @param {*} message - The message that caused the function to be called. Used to retrieve the author
     * @param {*} inventoryManager - The inventory manager class
     * @param {*} player - The player that is playing
     */
    async giveRandomWeapon(equipementManager, inventory, message, inventoryManager, player) {
        let weapon = await equipementManager.generateRandomWeapon();
        let neww = equipementManager.getEquipementEfficiency(weapon);
        let old = equipementManager.getEquipementEfficiency(equipementManager.getWeaponById(inventory.weaponId));
        console.log(neww + "/" + old);
        console.log(neww > old);
        if (neww > old) {
            inventory.weaponId = weapon.id;
            message.channel.send(Text.playerManager.newItem + equipementManager.displayWeapon(weapon));
            inventoryManager.updateInventory(inventory);
        }
        else {
            player = this.sellEquipement(player, weapon, message);
        }
        return player
    }


    /**
     * Select a random item Type 
     * @returns {String} - The type of the item that has been selected
     */
    chooseARandomItemType() {
        return DefaultValues.itemGenerator.tab[Math.round(Math.random() * (DefaultValues.itemGenerator.max - 1) + 1)];
    };


    /**
     * allow the player to gain some money corresponding to an equipement
     * @param {*} equipement - The equipement that has to be sold
     * @param {*} player - The player that will recieve the money
     * @param {*} message - The message that caused the function to be called. Used to retrieve the channel
     */
    sellEquipement(player, equipement, message) {
        let value = parseInt(DefaultValues.raritiesValues[equipement.rareness] + equipement.power);
        console.log("the item has been sold ! " + equipement.rareness);
        player.addMoney(value);
        message.channel.send(Text.playerManager.sellEmoji + message.author.username + Text.playerManager.sell + value + Text.playerManager.sellEnd)
        return player;
    }
}

module.exports = PlayerManager;