/**
 * Allow the bot owner or a badgemanager to give an item to somebody
 * @param {("fr"|"en")} language - Language to use in the response
 * @param {module:"discord.js".Message} message - Message from the discord server
 * @param {String[]} args=[] - Additional arguments sent with the command
 */
const giveBadgeCommand = async function (language, message, args) {
    if ((await canPerformCommand(message, language, PERMISSION.ROLE.BADGEMANAGER)) !== true) {
      return;
    }
    let embed = new discord.MessageEmbed();
    // the author of the command is the author of the bot
    let playerId = message.mentions.users.last().id;
    [entity] = await Entities.getOrRegister(playerId);

    await entity.Player.giveBadge(args[0]);
    await entity.Player.save();

    embed.setColor(JsonReader.bot.embed.default)
    .setAuthor(format(JsonReader.commands.giveBadgeCommand.getTranslation(language).giveSuccess, { pseudo: message.author.username }), message.author.displayAvatarURL())
    .setDescription(format(JsonReader.commands.giveBadgeCommand.getTranslation(language).descGive, { badge: args[0], player:  message.mentions.users.last() }));
    return await message.channel.send(embed);
};

module.exports = {
    'gb': giveBadgeCommand,
  };

