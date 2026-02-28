const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    static associate(models) {
      Contact.belongsTo(Contact, { as: 'primaryContact', foreignKey: 'linkedId' });
      Contact.hasMany(Contact, { as: 'secondaryContacts', foreignKey: 'linkedId' });
    }
  }
  Contact.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    phoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    linkedId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    linkPrecedence: {
      type: DataTypes.ENUM('primary', 'secondary'),
      allowNull: false,
      defaultValue: 'primary'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Contact',
    tableName: 'Contacts',
    paranoid: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['phoneNumber'] },
      { fields: ['linkedId'] }
    ]
  });
  return Contact;
};
