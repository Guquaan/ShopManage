const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db')

const Goods = sequelize.define('Goods',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    
    },
    name:{
        type:DataTypes.STRING(50),
        allowNull:false
    },
    category:{
        type:DataTypes.STRING(50),
        allowNull:false
    },
    price:{
        type:DataTypes.FLOAT,
        allowNull:false
    },
    stock:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    sales:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    image:{
        type:DataTypes.TEXT, // 存储图片的Base64或者URL
    },
    status:{
        type:DataTypes.STRING(10),
        defaultValue:'正常'
    },
    updateTime:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    }
}, {
    tableName:'goods',  // 数据库表名字
    timestamps:false    // 不自动添加时间戳字段
})

module.exports =  Goods ;