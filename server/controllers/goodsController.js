const Goods  = require('../models/Goods')

// 获取所有的商品
exports.getGoods = async (req,res)=>{
    try{
        const goods = await Goods.findAll()
        res.json(goods)
    }catch(err){
        res.status(500).json({error:err.message})
    }   
}

// 添加功能
exports.addGoods = async (req,res)=>{
    try{
        const newGoods = await Goods.create(req.body)
        res.status(201).json(newGoods)
    }catch(err){
        res.status(400).json({error:err.message})
    }
}

// 编辑功能
exports.updateGoods = async (req,res)=>{
    try{
        const { id } = req.params
        const [updated] = await Goods.update(req.body,{where:{id}})
        if(updated){
            const updatedGoods = await Goods.findByPk(id)
            res.json(updatedGoods)
        }else{
            res.status(404).json({error:'商品不存在'})
        }
    } catch(err){
        res.status(400).json({error:err.message})
    }

}

// 删除功能
exports.deleteGoods = async (req,res)=>{
    try{
        const { id } = req.params
        const deleted = await Goods.destroy({where:{id}})
        if(deleted){
            res.json({message:'商品已删除'})
        } else{
            res.status(404).json({error:'商品不存在'})
        }
    } catch(err){
        res.status(500).json({error:err.message})
    }
}