const PlayerManager = require('../classes/PlayerManager');
const EventManager = require('../classes/EventManager');
const Tools = require('../utils/Tools');
const DefaultValues = require('../utils/DefaultValues')
const Text = require('../text/Francais');


/**
 * Allow the user to learn more about what is going on with his character
 * @param message - The message that caused the function to be called. Used to retrieve the author of the message.
 */
const reportCommand = async function (message) {

   let eventManager = new EventManager;
   let playerManager = new PlayerManager;

   //loading of the current player
   let player = await playerManager.getCurrentPlayer(message);

   if (playerManager.checkState(player, message, ":baby::smiley::clock2::sick::snowflake::dizzy_face::zzz::confounded:")) {  //check if the player is not dead or sick

      playerManager.setPlayerAsOccupied(player);

      if (Tools.isANullNumber(player.getScore())) {
         generateEvent(message, eventManager, 0, playerManager, player, DefaultValues.report.startMoney, DefaultValues.report.startScore);
         return;
      }

      let time = player.calcTime(message.createdTimestamp);
      time = 200; // in testing purpose : Remove for realease
      let pointsGained = calculatePoints(player, time);
      let moneyChange = calculateMoney(player, time);

      let eventNumber = eventManager.chooseARandomEvent();
      // let eventNumber = XX; //allow to select a specific event in testing purpose

      switch (true) {

         case time < DefaultValues.report.minimalTime:
            displayErrorReport(message);
            break;

         case time <= DefaultValues.report.maximalTime && Math.round(Math.random() * DefaultValues.report.maximalTime) > time:
            let possibility = loadNothingToSayPossibility(eventManager);
            execPossibility(message, possibility, playerManager, player, moneyChange, pointsGained);
            break;

         default:
            generateEvent(message, eventManager, eventNumber, playerManager, player, moneyChange, pointsGained);
      }
   }
};


/**
 * display an event to the player
 * @param message - The message that caused the function to be called. Used to retrieve the author of the message.
 * @param {*} event - The event that has to be displayed
 * @returns {*} - The message object that has been sent by the bot
 */
const displayEvent = function (message, event) {
   return message.channel.send(Text.commands.report.reportStart + message.author.username + Text.events[event.id]).then(msg => {
      for (reac in event.emojis) {
         msg.react(event.emojis[reac]);
      }
      return msg;
   })
};

/**
 * Execute a possibility to the player
 * @param message - The message that caused the function to be called. Used to retrieve the author of the message.
 * @param {*} possibility - The possibility that has to be executed
 */
const execPossibility = function (message, possibility, playerManager, player, moneyChange, pointsGained) {
   let possibilityMessage;
   if (possibility.idEvent == 0) {
      if (possibility.emoji == "end") {
         possibilityMessage = displayPossibility(message, 0, 0, possibility);
      } else {
         possibilityMessage = displayPossibility(message, pointsGained, moneyChange, possibility);
         launchAdventure(message, pointsGained, moneyChange, player, possibility, playerManager)
      }
   } else {
      possibilityMessage = displayPossibility(message, pointsGained, moneyChange, possibility);
      applyPossibility(message, pointsGained, moneyChange, possibility, player, playerManager)
   }
   possibilityMessage += Text.possibilities[possibility.idEvent][possibility.emoji][possibility.id]
   message.channel.send(possibilityMessage);
};


/**
 * Calculate the amount of point a player will win during the event
 * @param {*} player - The player that is reacting to the event
 * @param {Number} time - The time elapsed since the previous report
 * @returns {Number} - The amount of points
 */
const calculatePoints = function (player, time) {
   return time + Math.round(
      Math.random() * (
         time / 10 + player.getLevel()
      )
   );
};

/**
 * Calculate the amount of money a player will or loose win during the event
 * @param {*} player - The player that is reacting to the event
 * @param {Number} time - The time elapsed since the previous report
 * @returns {Number} - The amount of money
 */
const calculateMoney = function (player, time) {
   return time / 10 + Math.round(
      Math.random() * (
         time / 10 + player.getLevel() / 5
      )
   );
};




/**
 * Check if the reaction recieved is corresponding to a reaction of the event
 * @param {*} event - The event that is related with the reaction
 * @param {*} reaction - The reaction recieved
 * @returns {Boolean} - true is the reaction is correct
 */
const reactionIsCorrect = function (event, reaction) {
   let contains = false;
   for (reac in event.emojis) {
      if (event.emojis[reac] == reaction.emoji.name)
         contains = true;
   }
   return contains
}


/**
 * allow to load the possibility to display if nothing happend since the previous report
 * @param {*} eventManager - The event manager class
 */
function loadNothingToSayPossibility(eventManager) {
   let possibilityNumber = eventManager.chooseARandomPossibility("report", "nothingToSay");
   return eventManager.loadPossibility("report", "nothingToSay", possibilityNumber);
}


/**
 * Allow to perform an event to a player
 * @param {*} message - The message that cause the event do be generated
 * @param {*} eventManager - The class that manage the event
 * @param {*} eventNumber  - The id of the event the player falls on
 */
async function generateEvent(message, eventManager, eventNumber, playerManager, player, moneyChange, pointsGained) {
   console.log(eventNumber);
   //load the event to display
   let event = eventManager.loadEvent(eventNumber);
   //display a message containing informations about the event and get this message back
   let reponse = await displayEvent(message, event);
   let eventIsOpen = true;

   const filter = (reaction, user) => {
      return (reactionIsCorrect(event, reaction) && user.id === message.author.id);
   };
   const collector = reponse.createReactionCollector(filter, {
      time: 120000
   });
   //execute this if a user answer to the event
   collector.on('collect', (reaction) => {
      if (eventIsOpen) {
         let possibilityNumber = eventManager.chooseARandomPossibility(eventNumber, reaction.emoji.name);
         let possibility = eventManager.loadPossibility(eventNumber, reaction.emoji.name, possibilityNumber);
         execPossibility(message, possibility, playerManager, player, moneyChange, pointsGained);
         eventIsOpen = false;
      }
   });
   //end of the time the user have to answer to the event
   collector.on('end', () => {
      if (eventIsOpen) {
         let possibilityNumber = eventManager.chooseARandomPossibility(eventNumber, "end");
         let possibility = eventManager.loadPossibility(eventNumber, "end", possibilityNumber);
         execPossibility(message, possibility, playerManager, player, moneyChange, pointsGained);
      }
   });
}


/**
 * display a possibility to the player
 * @param message - The message that caused the function to be called. Used to retrieve the author of the message.
 * @param {*} possibility - The possibility that has to be displayed
 * @param {Number} pointsGained - The amount of points the user gained during this event
 * @param {Number} moneyChange - The amount of money los or gained by the player during this event
 * @returns {String} - The message that has to be sent
 */
function displayPossibility(message, pointsGained, moneyChange, possibility) {
   let possibilityMessage = Text.commands.report.reportStart + message.author + Text.commands.report.points + pointsGained;
   if (Tools.isAPositiveNumberOrNull(moneyChange)) {
      possibilityMessage += Text.commands.report.moneyWin + moneyChange;
   }
   else {
      possibilityMessage += Text.commands.report.moneyLoose + moneyChange;
   }
   if (Tools.isANegativeNumber(possibility.healthPointsChange))
      possibilityMessage += Text.commands.report.healthLoose + -possibility.healthPointsChange;
   if (Tools.isAPositiveNumber(possibility.healthPointsChange))
      possibilityMessage += Text.commands.report.healthWin + possibility.healthPointsChange;
   if (Tools.isAPositiveNumber(possibility.timeLost))
      possibilityMessage += Text.commands.report.timeLost + Tools.displayDuration(possibility.timeLost);
   return possibilityMessage;
}


/**
 * save the effect of a possibility on a player 
 * @param message - The message that caused the function to be called. Used to retrieve the author of the message.
 * @param {*} possibility - The possibility that has been selected
 * @param {*} player - The player that is reacting to the event
 * @param {Number} pointsGained - The amount of points the user gained during this event
 * @param {Number} moneyChange - The amount of money los or gained by the player during this event
 * @param {*} playerManager - The player manager
 */
async function applyPossibility(message, pointsGained, moneyChange, possibility, player, playerManager) {
   //adding score
   player.addScore(pointsGained);
   player.addMoney(moneyChange);
   // if the number is below 0, remove money will be called by the add money method
   //the last time the player has been saw is now
   player.updateLastReport(message.createdTimestamp, possibility.timeLost, possibility.newEffect);
   player.addHealthPoints(possibility.healthPointsChange);
   // if the number is below 0, remove health Points will be called by the add Health Points method
   // we have to parse int this because elsewhere it is considered as a screen and it do 2 + 2 = 22
   player.setEffect(possibility.newEffect);
   if (possibility.item == "true") {
     player = await playerManager.giveRandomItem(message,player);
   }
   playerManager.updatePlayer(player);
}


/**
 * Create a new player in the database
 * @param message - The message that caused the function to be called. Used to retrieve the author of the message.
 * @param {*} player - The player that is reacting to the event
 * @param {Number} pointsGained - The amount of points the user gained during this event
 * @param {Number} moneyChange - The amount of money los or gained by the player during this event
 * @param {*} possibility - The possibility that has been selected
 * @param {*} playerManager - The player manager
 */
function launchAdventure(message, pointsGained, moneyChange, player, possibility, playerManager) {
   ;
   //adding score
   player.addScore(pointsGained);
   player.addMoney(moneyChange);
   // if the number is below 0, remove money will be called by the add money method
   //the last time the player has been saw is now
   player.updateLastReport(message.createdTimestamp, possibility.timeLost, possibility.newEffect);
   player.setEffect(possibility.newEffect);
   playerManager.addPlayer(player);
}


/**
 * display an error to the user if he has not waiting more that 1 hour
 * @param {*} message - The message that cause the command to be called
 */
function displayErrorReport(message) {
   message.channel.send(Text.commands.report.reportStart + message.author.username + Text.commands.report.noReport);
}


module.exports.ReportCommand = reportCommand;