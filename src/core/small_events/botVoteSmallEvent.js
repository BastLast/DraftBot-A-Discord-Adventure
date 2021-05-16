const doNothing = require('doNothingSmallEvent');
const DBL = require('../DBL');
/**
 * Main function of small event
 * @param {module:"discord.js".Message} message
 * @param {"fr"|"en"} language
 * @param {Entities} entity
 * @param {module:"discord.js".MessageEmbed} seEmbed - The template embed to send. The description already contains the emote so you have to get it and add your text
 * @returns {Promise<>}
 */
const executeSmallEvent = async function (message, language, entity, seEmbed) {
	if (await DBL.getTimeBeforeDBLRoleRemove(entity.discordUser_id) < 0) {
		// hasn't voted
		seEmbed.setDescription(JsonReader.small_events.botVote.emote + JsonReader.small_events.botVote.getTranslation(language).pleaseVote.stories[randInt(0, JsonReader.small_events.botVote.getTranslation(language).pleaseVote.stories.length)]);
	} else if (draftbotRandom.bool()) {
		//object win
		seEmbed.setDescription(JsonReader.small_events.botVote.emote + JsonReader.small_events.botVote.getTranslation(language).itemWin.stories[randInt(0, JsonReader.small_events.botVote.getTranslation(language).itemWin.stories.length)]);
		await giveRandomItem((await message.guild.members.fetch(entity.discordUser_id)).user, message.channel, language, entity);
	} else {
		//money win
		let moneyWon = draftbotRandom.integer(SMALL_EVENT.MINIMUM_MONEY_WON_VOTE, SMALL_EVENT.MAXIMUM_MONEY_WON_VOTE);
		entity.Player.addMoney(moneyWon);
		seEmbed.setDescription(JsonReader.small_events.botVote.emote + format(JsonReader.small_events.botVote.getTranslation(language).moneyWin.stories[randInt(0, JsonReader.small_events.botVote.getTranslation(language).moneyWin.stories.length)],{money:moneyWon}));
	}
	const msg = await message.channel.send(seEmbed);
	await entity.Player.save();
	log(entity.discordUser_id + " got botVote small event.");
};

module.exports = {
	executeSmallEvent: executeSmallEvent
};