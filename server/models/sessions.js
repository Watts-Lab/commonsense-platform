module.exports = (sequelize, DataTypes) => {
    
    const Users = sequelize.define("users", {
      
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false
        },

        firstName: {
            type: DataTypes.STRING,
            allowNull: true
        },

        lastName: {
            type: DataTypes.STRING,
            allowNull: true
        },

        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate:{
                notEmpty:{
                    args:true,
                    msg:"Email-id required"
                },
                isEmail:{
                    args:true,
                    msg:'Valid email-id required'
                }
            },
        },
      
        sessionId: {
            type: DataTypes.STRING,
            allowNull: false
        },



    });
    

    return Users;
};