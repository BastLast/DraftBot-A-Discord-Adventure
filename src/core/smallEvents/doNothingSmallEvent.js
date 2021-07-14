/**
 * Main function of small event
 * @param {module:"discord.js".Message} message
 * @param {"fr"|"en"} language
 * @param {Entities} entity
 * @param {module:"discord.js".MessageEmbed} seEmbed - The template embed to send. The description already contains the emote so you have to get it and add your text
 * @returns {Promise<>}
 */
const executeSmallEvent = async function(message, language, entity, seEmbed) {
	const translationDN = JsonReader.smallEvents.doNothing.getTranslation(language);
	seEmbed.setDescription(JsonReader.smallEvents.doNothing.emote + translationDN.stories[randInt(0, translationDN.stories.length)]);
	await message.channel.send(seEmbed);
	log(entity.discordUserId + " done nothing.");
};

module.exports = {
	executeSmallEvent: executeSmallEvent
};