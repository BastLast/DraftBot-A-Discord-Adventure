// Defines allowed datasource
global.DATASOURCE = {
  SQLITE: "sqlite",
  JSON: "json"
};

// Effect
global.EFFECT = {
  BABY: ":baby:",
  SMILEY: ":smiley:",
  AWAITINGANSWER: ":clock10:", // may be deleted : is used to avoir interaction when the bot is awaiting an answer
  DEAD: ":skull:",
  SLEEPING: ":sleeping: ",
  DRUNK: ":zany_face:",
  FROZEN: ":cold_face:",
  HURT: ":head_bandage:",
  SICK: ":sick:",
  LOCKED: ":lock:",
  INJURED: ":dizzy_face:",
  OCCUPIED: ":clock2:",
  CONFOUNDED: ":confounded:"
};

// Object nature
global.NATURE = {
  NONE: 0,
  HEALTH: 1,
  SPEED: 2,
  DEFENSE: 3,
  ATTACK: 4,
  HOSPITAL: 5,
  MONEY: 6
};

global.PERMISSION = {
  ROLE: {
    BOTOWNER: 'owner',
    BADGEMANAGER: 'manager',
    SUPPORT: 'support',
    ADMINISTRATOR: 'administrator',
    ALL: 'all'
  }
};

global.ITEMTYPE = {
  POTION: 'potion',
  WEAPON: 'weapon',
  ARMOR: 'armor',
  OBJECT: 'object'
}

global.ARGUMENTS = {
  RESET: 'reset'
}