'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Contacts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      phoneNumber: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      linkedId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Contacts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      linkPrecedence: {
        type: Sequelize.ENUM('primary', 'secondary'),
        allowNull: false,
        defaultValue: 'primary'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
    await queryInterface.addIndex('Contacts', ['email']);
    await queryInterface.addIndex('Contacts', ['phoneNumber']);
    await queryInterface.addIndex('Contacts', ['linkedId']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Contacts');
  }
};
