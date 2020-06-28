module.exports = (sequelize, DataTypes) => {

  const Armors = sequelize.define('Armors', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rarity: {
      type: DataTypes.INTEGER,
      defaultValue: JsonReader.models.armors.rarity
    },
    rawAttack: {
      type: DataTypes.INTEGER,
      defaultValue: JsonReader.models.armors.rawAttack
    },
    rawDefense: {
      type: DataTypes.INTEGER,
      defaultValue: JsonReader.models.armors.rawDefense
    },
    rawSpeed: {
      type: DataTypes.INTEGER,
      defaultValue: JsonReader.models.armors.rawSpeed
    },
    attack: {
      type: DataTypes.INTEGER,
      defaultValue: JsonReader.models.armors.attack
    },
    defense: {
      type: DataTypes.INTEGER,
      defaultValue: JsonReader.models.armors.defense
    },
    speed: {
      type: DataTypes.INTEGER,
      defaultValue: JsonReader.models.armors.speed
    },
    fr: {
      type: DataTypes.TEXT
    },
    en: {
      type: DataTypes.TEXT
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: require('moment')().format('YYYY-MM-DD HH:mm:ss')
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: require('moment')().format('YYYY-MM-DD HH:mm:ss')
    }
  }, {
    tableName: 'armors',
    freezeTableName: true
  });

  Armors.beforeSave((instance, options) => {
    instance.setDataValue('updatedAt', require('moment')().format('YYYY-MM-DD HH:mm:ss'));
  });

  // TODO 2.0
  // async getRandomWithRarity() {
  //   const desiredRarity = generateRandomRarity();
  //   const possibleArmors = Object.entries(this.armors).filter(key => this.armors[key[0]].rarity === desiredRarity);
  //   const id = possibleArmors[Math.floor(Math.random() * possibleArmors.length)][0];
  //   return this.armors[id];
  // }

  /**
   * @param {("fr"|"en")} language - The language the inventory has to be displayed in
   */
  Armors.prototype.toFieldObject = async function(language) {
    return {
      name: JsonReader.items.getTranslation(language).armors.fieldName,
      value: (this.id === 0) ? this[language] : format(
          JsonReader.items.getTranslation(language).armors.fieldValue, {
            name: this[language],
            rarity: this.getRarityTranslation(language),
            values: this.getValues(language),
          }),
    };
  };

  /**
   * @param {("fr"|"en")} language
   * @return {String}
   */
  Armors.prototype.getRarityTranslation = function(language) {
    return JsonReader.items.getTranslation(language).rarities[this.rarity];
  };

  /**
   * Return the property from rawProperty and property modifier
   * @returns {Number}
   */
  Armors.prototype.getAttack = function() {
    return JsonReader.items.power[this.rarity][this.rawAttack] + this.attack;
  };

  /**
   * Return the property from rawProperty and property modifier
   * @returns {Number}
   */
  Armors.prototype.getDefense = function() {
    return JsonReader.items.power[this.rarity][this.rawDefense] + this.defense;
  };

  /**
   * Return the property from rawProperty and property modifier
   * @returns {Number}
   */
  Armors.prototype.getSpeed = function() {
    return JsonReader.items.power[this.rarity][this.rawSpeed] + this.speed;
  };

  /**
   * @param {("fr"|"en")} language
   * @return {String}
   */
  Armors.prototype.getValues = function(language) {
    let values = [];

    if (this.getAttack() !== 0) {
      values.push(format(JsonReader.items.getTranslation(language).attack, {attack: this.getAttack()}));
    }

    if (this.getDefense() !== 0) {
      values.push(format(JsonReader.items.getTranslation(language).defense, {defense: this.getDefense()}));
    }

    if (this.getSpeed() !== 0) {
      values.push(format(JsonReader.items.getTranslation(language).speed, {speed: this.getSpeed()}));
    }

    return values.join(' ');
  };

  return Armors;
};
