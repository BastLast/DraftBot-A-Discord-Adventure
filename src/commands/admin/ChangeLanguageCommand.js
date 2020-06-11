/**
 * Allow an admin to change the prefix the bot use in a specific server
 * @param {("fr"|"en")} language - Language to use in the response
 * @param {module:"discord.js".Message} message - Message from the discord server
 * @param {String[]} args=[] - Additional arguments sent with the command
 */

const changeLanguageCommand = async function (language, message, args) {
    if ((await canPerformCommand(message, language, PERMISSION.ROLE.ADMINISTRATOR)) !== true) {
        return;
    }
    let embed = new discord.MessageEmbed();
    let server;

    //TODO Faire getOrRegister dans Servers.js de core/models
    [server] = await Servers.getOrRegister(message.guild.id);
    if(server.language == "fr"){
        server.language = "en";
        embed.setColor(JsonReader.bot.embed.default)
        .setAuthor(format(JsonReader.commands.changeLanguage.getTranslation(language).title, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(format(JsonReader.commands.changeLanguage.getTranslation(language).desc));
        return await message.channel.send(embed);
    }else{
        server.language = "fr";
        embed.setColor(JsonReader.bot.embed.default)
        .setAuthor(format(JsonReader.commands.changeLanguage.getTranslation(language).title, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(format(JsonReader.commands.changeLanguage.getTranslation(language).desc));
        return await message.channel.send(embed);
    }
    await server.save();
}
      


module.exports = {
    'language': changeLanguageCommand,
  };



