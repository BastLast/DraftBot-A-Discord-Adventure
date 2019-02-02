const Inventory = require('./Inventory');
const Object = require('./Object');
const Equipement = require('./Equipement');
const Potion = require('./Potion');
const DefaultValues = require('../utils/DefaultValues')
const Config = require('../utils/Config')
const sql = require("sqlite");
const Tools = require('../utils/Tools');

sql.open("./modules/data/database.sqlite");

class InventoryManager {


    /**
    * Return a promise that will contain the inventory that is owned by the person who send the message
    * @param message - The message that caused the function to be called. Used to retrieve the author of the message
    * @returns {promise} - The promise that will be resolved into a inventory
    */
    getCurrentInventory(message) {
        return sql.get(`SELECT * FROM inventory WHERE playerId ="${message.author.id}"`).then(inventory => {
            if (!inventory) { //inventory is not in the database
                console.log(`Utilisateur inconnu : ${message.author.username}`);
                return this.getNewInventory(message);
            } else { //inventory is in the database
                console.log(`Utilisateur reconnu : ${message.author.username}`);
                return new Inventory(inventory.playerId, inventory.weaponId, inventory.armorId, inventory.potionId, inventory.objectId, inventory.backupItemId)
            }
        }).catch(error => { //there is no database
            console.error(error)
            return false;
        })
    }


    /**
    * Return a promise that will contain the inventory that is owned by the person who send the message
    * @param id - the id of the inventory that own the inventory
    * @returns {promise} - The promise that will be resolved into a inventory
    */
    getInventoryById(id) {
        return sql.get(`SELECT * FROM inventory WHERE playerId ="${id}"`).then(inventory => {
            if (!inventory) { //inventory is not in the database
                console.log(`Utilisateur inconnu : ${id}`);
                return this.getNewInventoryById(id);
            } else { //inventory is in the database
                console.log(`Utilisateur reconnu : ${id}`);
                return new Inventory(inventory.playerId, inventory.weaponId, inventory.armorId, inventory.potionId, inventory.objectId, inventory.backupItemId)
            }
        }).catch(error => { //there is no database
            console.error(error)
            return false;
        })
    }


    /**
     * Return an inventory created from the defaul values and save it to the database
     * @param message - The message that caused the function to be called. Used to retrieve the author of the message
     * @returns {*} - A new inventory
     */
    getNewInventory(message) {
        console.log('Generating a new inventory...');
        let inventory = new Inventory(message.author.id, DefaultValues.inventory.weapon, DefaultValues.inventory.armor, DefaultValues.inventory.potion, DefaultValues.inventory.object, DefaultValues.inventory.backupItem);
        this.addInventory(inventory);
        return inventory;
    }


    /**
     * Return an inventory created from the defaul values and save it to the database
     * @param id - The id that has to be used to create the inventory
     * @returns {*} - A new inventory
     */
    getNewInventoryById(id) {
        console.log('Generating a new inventory...');
        let inventory = new Inventory(id, DefaultValues.inventory.weapon, DefaultValues.inventory.armor, DefaultValues.inventory.potion, DefaultValues.inventory.object, DefaultValues.inventory.backupItem);
        this.addInventory(inventory);
        return inventory;
    }


    /**
     * Allow to save the current state of a inventory in the database
     * @param {*} inventory - The inventory that has to be saved
     */
    updateInventory(inventory) {
        console.log("Updating inventory ...");
        sql.run(`UPDATE inventory SET playerId = ${inventory.playerId}, weaponId = "${inventory.weaponId}", armorId = "${inventory.armorId}", potionId = "${inventory.potionId}", objectId = "${inventory.objectId}", backupItemId = "${inventory.backupItemId}" WHERE playerId = ${inventory.playerId}`).catch(console.error);
        console.log("Inventory updated !");
    }

    /**
     * Allow to save a new inventory in the database
     * @param {*} inventory - The inventory that has to be saved
     */
    addInventory(inventory) {
        console.log("Creating inventory ...");
        sql.run(`INSERT INTO inventory (playerId, weaponId, armorId, potionId, objectId, backupItemId) VALUES (${inventory.playerId},"${inventory.weaponId}","${inventory.armorId}","${inventory.potionId}","${inventory.objectId}","${inventory.backupItemId}") `).catch(console.error);
        console.log("inventory created !");
    }


}

module.exports = InventoryManager;