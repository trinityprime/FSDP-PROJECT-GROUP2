module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.STRING(8),
            allowNull: false
        },
        dob: {
            type: DataTypes.DATE,
            allowNull: true
        },
        role: {
            type: DataTypes.ENUM('volunteer', 'organization', 'admin'),
            defaultValue: 'volunteer'
        }
    }, {
        tableName: 'users',
    });

    User.associate = (models) => {
        User.hasMany(models.Tutorial, {
            foreignKey: "userId",
            onDelete: "cascade"
        });
    };

    return User;
}
