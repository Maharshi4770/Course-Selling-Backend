const { Router } = require('express')
const { usermiddleware } = require('../middleware/user')
const {purchaseModel, courseModel}  = require('../db')
const courseRouter = Router()

//Should chekc that user has actually paid the price 
courseRouter.post("/purchase",usermiddleware,async function(req,res){
    const userId = req.userId;
    const courseId = req.body.courseId;

    await purchaseModel.create({
        userId,
        courseId
    })
    res.json({
        msg: 'You have successfully bought the course.'
    })
})


courseRouter.get("/preview",async function(req,res){
    const courses = await courseModel.find({});

    res.json({ courses });
})

module.exports = {
    courseRouter: courseRouter
}