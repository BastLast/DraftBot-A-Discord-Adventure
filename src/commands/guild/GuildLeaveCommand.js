/**
 * Allow to leave a guild
 * @param {("fr"|"en")} language - Language to use in the response
 * @param {module:"discord.js".Message} message - Message from the discord server
 * @param {String[]} args=[] - Additional arguments sent with the command
 */
const GuildLeaveCommand = async (language, message, args) => {
  let entity; let guild;
  const confirmationEmbed = new discord.MessageEmbed();

  [entity] = await Entities.getOrRegister(message.author.id);

  if ((await canPerformCommand(message, language, PERMISSION.ROLE.ALL, [EFFECT.BABY, EFFECT.DEAD], entity)) !== true) {
    return;
  }
  if (await sendBlockedError(message.author, message.channel, language)) {
    return;
  }

  // search for a user's guild
  try {
    guild = await Guilds.getById(entity.Player.guild_id);
  } catch (error) {
    guild = null;
  }

  if (guild == null) { // not in a guild
    return sendErrorMessage(
      message.author,
      message.channel,
      language,
      JsonReader.commands.guildLeave.getTranslation(language).notInAGuild);
  }
  addBlockedPlayer(entity.discordUser_id, 'guildLeave');
  // generate confirmation embed
  confirmationEmbed.setAuthor(format(JsonReader.commands.guildLeave.getTranslation(language).leaveTitle, {
    pseudo: message.author.username,
  }), message.author.displayAvatarURL());
  if (guild.chief_id != entity.id) {
    confirmationEmbed.setDescription(format(JsonReader.commands.guildLeave.getTranslation(language).leaveDesc, {
      guildName: guild.name,
    }));
  } else {
    confirmationEmbed.setDescription(format(JsonReader.commands.guildLeave.getTranslation(language).leaveChiefDesc, {
      guildName: guild.name,
    }));
  }

  const msg = await message.channel.send(confirmationEmbed);

  const embed = new discord.MessageEmbed();
  const filterConfirm = (reaction, user) => {
    return ((reaction.emoji.name == MENU_REACTION.ACCEPT || reaction.emoji.name == MENU_REACTION.DENY) && user.id === message.author.id);
  };

  const collector = msg.createReactionCollector(filterConfirm, {
    time: 120000,
    max: 1,
  });

  collector.on('end', async (reaction) => {
    removeBlockedPlayer(entity.discordUser_id);
    if (reaction.first()) { // a reaction exist
      if (reaction.first().emoji.name == MENU_REACTION.ACCEPT) {
        entity.Player.guild_id = null;

        if (guild.chief_id == entity.id) {
          // the chief is leaving : destroy the guild
          await Players.update({ guild_id: null }, {
            where: {
              guild_id: guild.id,
            },
          });
          await Guilds.destroy({
            where: {
              id: guild.id,
            },
          });
        }

        await Promise.all([
          entity.save(),
          entity.Player.save(),
        ]);

        embed.setAuthor(format(JsonReader.commands.guildLeave.getTranslation(language).successTitle, {
          pseudo: message.author.username,
          guildName: guild.name,
        }), message.author.displayAvatarURL());
        embed.setDescription(JsonReader.commands.guildLeave.getTranslation(language).leavingSuccess);
        return message.channel.send(embed);
      }
    }

    // Cancel leaving
    return sendErrorMessage(
      message.author,
      message.channel,
      language,
      format(JsonReader.commands.guildLeave.getTranslation(language).leavingCancelled, {
        guildName: guild.name,
      }));
  });

  await Promise.all([
    msg.react(MENU_REACTION.ACCEPT),
    msg.react(MENU_REACTION.DENY),
  ]);
};

module.exports = {
  commands: [
    {
      name: 'guildleave',
      func: GuildLeaveCommand,
      aliases: ['gleave', 'gl']
    }
  ]
};
