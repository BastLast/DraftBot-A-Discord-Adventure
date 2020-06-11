class MessageError {

  /**
   * @param {module:"discord.js".Message} message - Message from the discord server
   * @param {String} permission
   * @param {("fr"|"en")} language
   * @param {String[]} disallowEffects
   * @param {Entities} entity
   * @return {Promise<any>}
   */
  static async canPerformCommand(message, language, permission, disallowEffects = null, entity = null) {


    if (permission === PERMISSION.ROLE.BADGEMANAGER) {
      if (!message.member.roles.cache.has(JsonReader.app.BADGE_MANAGER_ROLE)) {
        return await MessageError.permissionErrorMe(message, language, permission);
      }
    }

    if (permission === PERMISSION.ROLE.SUPPORT) {
      if (!message.member.roles.cache.has(JsonReader.app.SUPPORT_ROLE)) {
        return await MessageError.permissionErrorMe(message, language, permission);
      }
    }

    if (permission === PERMISSION.ROLE.ADMINISTRATOR) {
      if (!message.member.hasPermission("ADMINISTRATOR")) {
        return await MessageError.permissionErrorMe(message, language, permission);
      }
    }

    if (permission === PERMISSION.ROLE.BOTOWNER) {
      if (message.author.id != JsonReader.app.BOT_OWNER_ID) {
        return await MessageError.permissionErrorMe(message, language, permission);
      }
    }

    // Check disallowEffects on entity
    if(disallowEffects == null){return true;}
    let disallowEffect = disallowEffects.indexOf(entity.effect);
    if (disallowEffect !== -1) {
      if (message.author.id === entity.discordUser_id) {
        return await MessageError.effectsErrorMe(message, language, entity, disallowEffects[disallowEffect]);
      } else {
        // MessageError.effectsErrorPlayer();
      }
    }

    return true;
  }

  /**
   * @param {module:"discord.js".Message} message - Message from the discord server
   * @param {("fr"|"en")} language
   * @param {String} permission
   * @return {Promise<Message>}
   */
  static async permissionErrorMe(message, language, permission) {
    let embed = new discord.MessageEmbed()
      .setColor(JsonReader.bot.embed.error);

    if (permission === PERMISSION.ROLE.BADGEMANAGER) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titlePermissionError, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(JsonReader.error.getTranslation(language).badgeManagerPermissionMissing);
    }

    if (permission === PERMISSION.ROLE.SUPPORT) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titlePermissionError, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(JsonReader.error.getTranslation(language).dmSupportPermissionMissing);
    }

    if (permission === PERMISSION.ROLE.ADMINISTRATOR) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titlePermissionError, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(JsonReader.error.getTranslation(language).administratorPermissionMissing);
    }

    if (permission === PERMISSION.ROLE.BOTOWNER) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titlePermissionError, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(JsonReader.error.getTranslation(language).botOwnerPermissionMissing);
    }

    return await message.channel.send(embed);
  }

  /**
   * @param {module:"discord.js".Message} message - Message from the discord server
   * @param {("fr"|"en")} language
   * @param {Entities} entity
   * @param {String} effect
   * @return {Promise<Message>}
   */
  static async effectsErrorMe(message, language, entity, effect) {
    let embed = new discord.MessageEmbed()
      .setColor(JsonReader.bot.embed.error);

    if (entity.effect === EFFECT.SMILEY) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titleMeIsFine, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(entity.effect + JsonReader.error.getTranslation(language).notPossibleWithoutStatus);
    }

    if (entity.effect === EFFECT.BABY) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titleMeIsBaby, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(entity.effect + JsonReader.error.getTranslation(language).meIsBaby);
    }

    if (effect === EFFECT.DEAD) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titleMeIsDead, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(entity.effect + JsonReader.error.getTranslation(language).meIsDead);
    }

    if (effect === EFFECT.SLEEPING) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titleMeIsSleeping, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(entity.effect + JsonReader.error.getTranslation(language).pleaseWaitForHeal);
    }

    if (effect === EFFECT.DRUNK) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titleMeIsDrunk, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(entity.effect + JsonReader.error.getTranslation(language).pleaseWaitForHeal);
    }
    if (effect === EFFECT.HURT) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titleMeIsHurt, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(entity.effect + JsonReader.error.getTranslation(language).pleaseWaitForHeal);
    }

    if (effect === EFFECT.SICK) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titleMeIsSick, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(entity.effect + JsonReader.error.getTranslation(language).pleaseWaitForHeal);
    }

    if (effect === EFFECT.LOCKED) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titleMeIsLocked, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(entity.effect + JsonReader.error.getTranslation(language).pleaseWait);
    }
    if (effect === EFFECT.INJURED) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titleMeIsInjured, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(entity.effect + JsonReader.error.getTranslation(language).pleaseWaitForHeal);
    }

    if (effect === EFFECT.OCCUPIED) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titleMeIsOccupied, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(entity.effect + JsonReader.error.getTranslation(language).pleaseWaitForHeal);
    }

    if (effect === EFFECT.CONFOUNDED) {
      embed
        .setAuthor(format(JsonReader.error.getTranslation(language).titleMeIsConfounded, { pseudo: message.author.username }), message.author.displayAvatarURL())
        .setDescription(entity.effect + JsonReader.error.getTranslation(language).pleaseWaitForHeal);
    }

    return await message.channel.send(embed);
  }

  /**
   * Handle error if needed
   */
  static async errorPlayer(message, language, player) {
    let embed = new discord.MessageEmbed()
      .setColor(JsonReader.bot.embed.error)
      .setTitle(format(JsonReader.error.getTranslation(language).title, { pseudo: message.author.username }))
      .setAuthor(message.author.username, message.author.displayAvatarURL());

    if (player.effect === EFFECT.BABY) {
      embed
        .setDescription(JsonReader.error.getTranslation(language).playerIsBaby, {
          askedPseudo: player.getPseudo(language)
        });
    }

    if (player.effect === EFFECT.DEAD) {
      embed
        .setDescription(JsonReader.error.getTranslation(language).playerIsDead, {
          askedPseudo: player.getPseudo(language)
        });
    }

    if (player.effect === EFFECT.SLEEPING) {
      embed
        .setDescription(JsonReader.error.getTranslation(language).playerIsSleeping, {
          askedPseudo: player.getPseudo(language)
        });
    }

    if (player.effect === EFFECT.DRUNK) {
      embed
        .setDescription(JsonReader.error.getTranslation(language).playerIsDrunk, {
          askedPseudo: player.getPseudo(language)
        });
    }
    if (player.effect === EFFECT.HURT) {
      embed
        .setDescription(JsonReader.error.getTranslation(language).playerIsHurt, {
          askedPseudo: player.getPseudo(language)
        });
    }

    if (player.effect === EFFECT.SICK) {
      embed
        .setDescription(JsonReader.error.getTranslation(language).playerIsSick, {
          askedPseudo: player.getPseudo(language)
        });
    }

    if (player.effect === EFFECT.LOCKED) {
      embed
        .setDescription(JsonReader.error.getTranslation(language).playerIsLocked, {
          askedPseudo: player.getPseudo(language)
        });
    }
    if (player.effect === EFFECT.INJURED) {
      embed
        .setDescription(JsonReader.error.getTranslation(language).playerIsInjured, {
          askedPseudo: player.getPseudo(language)
        });
    }

    if (player.effect === EFFECT.OCCUPIED) {
      embed
        .setDescription(JsonReader.error.getTranslation(language).playerIsOccupied, {
          askedPseudo: player.getPseudo(language)
        });
    }

    if (player.effect === EFFECT.CONFOUNDED) {
      embed
        .setDescription(JsonReader.error.getTranslation(language).playerIsCondounded, {
          askedPseudo: player.getPseudo(language)
        });
    }

    return await message.channel.send(embed);
  }

}

global.canPerformCommand = MessageError.canPerformCommand;
global.errorMe = MessageError.errorMe;
global.errorPlayer = MessageError.errorPlayer;
