const Config = require("utils/Config");
const Figlet = require("figlet");
require("colors");
const Console = require('data/text/Console');
const DraftBot = require("class/DraftBot");

// const ServerManager = require('src/classes/ServerManager');
// const PlayerManager = require('./src/classes/PlayerManager');

Figlet(Console.reboot, (err, data) => {
  console.log(data.red);
  console.log(Console.br.grey);
});

const draftbot = new DraftBot(Config);

/**
 * Will be executed whenever the bot has started
 */
draftbot.client.on("ready", async () => {

  await draftbot.databaseManager.checkDatabaseValidity();

  // draftbot.checkEasterEggsFile();

  draftbot.displayConsoleChannel(Console.startStatus + Config.version);
  draftbot.setActivity();

  // //trigger of change week : Update weeklyScore value to 0 for each player and reset weekly top.
  // setInterval(async function () { // Set interval for checking
  //   await checkTopWeek();
  // }, 50000);

});

/**
 * Will be executed each time the bot join a new server
 */
draftbot.client.on("guildCreate", guilde => {
  let string = "";
  let serverManager = new ServerManager();
  let { validation, nbMembres, nbBot, ratio } = serverManager.getValidationInfos(guilde);
  string += Console.guildJoin.begin + guilde + Console.guildJoin.persons + nbMembres + Console.guildJoin.bots + nbBot + Console.guildJoin.ratio + ratio + Console.guildJoin.validation + validation;
  displayConsoleChannel(string);
  if (validation == ":x:") {
    sendLeavingMessage(guilde);
    //guilde.leave() //temporairement désactivé pour top.gg
  }
  console.log(string);
});

/**
 * Will be executed each time the bot leave a server
 */
draftbot.client.on("guildDelete", guilde => {
  let string = "";
  let serverManager = new ServerManager();
  let { validation, nbMembres, nbBot, ratio } = serverManager.getValidationInfos(guilde);
  string += Console.guildJoin.beginquit + guilde + Console.guildJoin.persons + nbMembres + Console.guildJoin.bots + nbBot + Console.guildJoin.ratio + ratio + Console.guildJoin.validation + validation;
  displayConsoleChannel(string);
  console.log(string);
});

/**
 * Will be executed each time the bot recieve a message
 */
draftbot.client.on("message", (message) => {
  //check if the user is a bot before doing anything
  if (message.author.bot) return;
  if (message.guild == null) {
    return commandReader.handlePrivateMessage(message, client, talkedRecently);
  }
  commandReader.handleMessage(message, client, talkedRecently);
});

/**
 * Will be executed each time a reaction is added to a message
 */
draftbot.client.on("messageReactionAdd", async (reaction) => {
  //check if the user is a bot before doing anything
  if (reaction.users.last().bot) return;

  let Text = await chargeText(reaction);
  let isUnderAProfileMessage = checkReactionIsUnderAProfileMessage(reaction);
  if (isUnderAProfileMessage && reaction.me && reaction.message.author.id == client.user.id) {
    //only answer if the reaction is a badge under a profile message
    reaction.message.channel.send(Text.badges[reaction.emoji]).then(msg => {
      msg.delete(5000);
    }).catch(err => { });
  }
});

draftbot.client.login(Config.DISCORD_CLIENT_TOKEN);


// const talkedRecently = new Set();
//
//
//
// /**
//  * Returns the ISO week of the date.
//  */
// Date.prototype.getWeek = function () {
//   var date = new Date(this.getTime());
//   date.setHours(0, 0, 0, 0);
//   // Thursday in current week decides the year.
//   date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
//   // January 4 is always in week 1.
//   var week1 = new Date(date.getFullYear(), 0, 4);
//   // Adjust to Thursday in week 1 and count number of weeks from date to week1.
//   return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
//     - 3 + (week1.getDay() + 6) % 7) / 7);
// }
//
// /**
//  * Check if the recieved reaction has been set under a profile message.
//  * @param {*} reaction
//  */
// function checkReactionIsUnderAProfileMessage(reaction) {
//   let isUnderAProfileMessage;
//   try {
//     isUnderAProfileMessage = reaction.message.embeds[0].fields[0].name.includes("Information");
//   }
//   catch (error) { //the reaction was not added on a profile message
//     isUnderAProfileMessage = false;
//   }
//   return isUnderAProfileMessage;
// }
//
// /**
//  * Check if the top week need to be reset and if so, proceed to reset the top week
//  */
// async function checkTopWeek() {
//   let weekNumber = getCurrentWeekNumber();
//   let lastweekNumber = await sql.get(`SELECT * FROM database`);
//   if (lastweekNumber.lastReset !== weekNumber) {
//     await resetTopWeek(weekNumber);
//   }
// }
//
// /**
//  * Get the current week number
//  * @return {number}
//  */
// function getCurrentWeekNumber() {
//   let date = new Date(); // Create a Date object to find out what time it is
//   date.setHours(date.getHours() + 1);
//   return date.getWeek() + 1;
// }
//
// /**
//  * Reset the topweek
//  * @param {*} weekNumber Current week number used to save the last time the topweek has been reseted
//  */
// async function resetTopWeek(weekNumber) {
//   sql.run(`UPDATE database SET lastReset = ${weekNumber}`).catch(console.error);
//   let gagnant = await sql.get(`select * from player order by weeklyScore desc limit 1`).catch(console.error);
//   if (gagnant != null) {
//     let playerManager = new PlayerManager();
//     let player = await playerManager.getPlayerById(gagnant.discordId);
//     displayAnnouncementsChannel(":trophy: **Le classement de la semaine est terminé ! Le gagnant est :**  <@" + gagnant.discordId + ">", ":trophy: **The weekly ranking has ended! The winner is:**  <@" + gagnant.discordId + ">");
//     giveTopWeekBadge(player);
//     playerManager.updatePlayer(player);
//   }
//  databaseManager.resetWeeklyScoreAndRank();
//   console.log("# WARNING # Weekly leaderboard has been reset !");
// }
//
// /**
//  * Give the winner the badge for leading the topweek
//  * @param {*} player
//  */
// function giveTopWeekBadge(player) {
//   if (player.badges != "") {
//     if (player.badges.includes("🎗️")) {
//       console.log("Le joueur a déjà le badge");
//     }
//     else {
//       player.badges = player.badges + "-🎗️";
//     }
//   }
//   else {
//     player.badges = "🎗️";
//   }
// }
//
// /**
//  * Send a message in the channels "announcements" of the bot main server
//  * @param {String} messagefr the french version of the mssage
//  * @param {String} messageen the english version of the mssage
//  */
// function displayAnnouncementsChannel(messagefr, messageen) {
//   client.guilds.get(Config.MAIN_SERVER_ID).channels.get(Config.FRENCH_ANNOUNCEMENT_CHANNEL_ID).send(messagefr).catch(err => { });
//   client.guilds.get(Config.MAIN_SERVER_ID).channels.get(Config.ENGLISH_ANNOUNCEMENT_CHANNEL_ID).send(messageen).catch(err => { });
// }
//
// /**
//  * Charge the english file
//  * @param {*} reaction
//  */
// async function chargeText(reaction) {
//   let serverManager = new ServerManager();
//   let server = await serverManager.getServer(reaction.message);
//   if (reaction.message.channel.id == Config.ENGLISH_CHANNEL_ID) {
//     server.language = "en";
//   }
//   let Text = require('./src/text/' + server.language);
//   return Text;
// }
//
//
// /**
//  * Send a message to the owner of the guild the bot is leaving
//  * @param {*} guilde - The guild the bot is leaving
//  */
// function sendLeavingMessage(guilde) {
//   guilde.owner.send(Console.departurMessage);
// }