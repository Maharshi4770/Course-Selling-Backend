const {Router} = require('express')
const { adminModel, courseModel } = require("../db")
const jwt = require('jsonwebtoken')
const {JWT_ADMIN_SECRET} = require("../config")
const adminRouter = Router();
const { z } = require('zod')
const bcrypt = require('bcrypt')
const {adminmiddleware} = require('../middleware/admin')

adminRouter.post("/signup", async function (req, res) {

    const requirebody = z.object({
        email: z.string().email().max(30),
        firstName: z.string().min(3).max(15),
        lastName: z.string().min(3).max(15),
        password: z.string().min(7).max(15)
            .refine(val => /[A_Z]/.test(val), {
                msg: 'password must include lowercase letter'
            })
            .refine(val => /[a-z]/.test(val), {
                msg: 'Password must include Uppercase letter'
            })
            .refine(val => /[^A-Za-z0-9]/.test(val), {
                message: 'Must include a special character',
            }),
    })

    const { success, data, error } = requirebody.safeParse(req.body);

    if (!success) {
        return res.json({
            msg: 'Incorrect Format',
            error: error,
        });
    }

    const { email, password, firstName, lastName } = req.body;

    try {
        const hashedpassword = await bcrypt.hash(password, 4);

        adminModel.create({
            email,
            firstName,
            lastName,
            password: hashedpassword
        })

        return res.json({
            msg: 'You are SignedUp'
        })
    } catch (e) {
        return res.json({
            msg: 'User already exists'
        })
    }
})

adminRouter.post("/signin", async function (req, res) {
    const {email,password} = req.body;

    const user = await adminModel.findOne({
        email:email,
    })

    if(!user){
        res.status(202).json({
            msg: 'User is not available'
        })
        return
    }

    const passwrodmatch = await bcrypt.compare(password,user.password);

    if(passwrodmatch){
        const token = jwt.sign({
            id: user._id,
        },JWT_ADMIN_SECRET)

    res.json({token: token})
    }
    else{
        res.json({
            msg: 'Invalid login credentials'
        })
    }
})

adminRouter.post("/course",adminmiddleware, async function (req, res) {
    const adminId = req.userId;

    const { title, description, price, imageUrl} = req.body;

    const course = await courseModel.create({
        title,
        description,
        imageUrl,
        price,
        creatorId: adminId
    })
    
    res.json({
        msg: 'Course successfully created',
        courseId: course._id 
    })
})
adminRouter.put("/course", adminmiddleware, async (req, res) => {
    const adminId = req.userId;
    const { title, description, price, imageUrl, courseId } = req.body;

    try {
        // Find the course
        const course = await courseModel.findById(courseId);

        // Check if course exists and if the admin is the creator
        if (!course || course.creatorId != adminId) {
            return res.status(403).json({ msg: "Not allowed to update this course" });
        }

        // Update course fields
        course.title = title;
        course.description = description;
        course.price = price;
        course.imageUrl = imageUrl;

        await course.save();

        res.json({ msg: "Course updated successfully" });
    } catch (err) {             
        res.status(500).json({ msg: "Something went wrong" });
    }
});

adminRouter.get("/course/bulk",adminmiddleware, async function (req, res) {
    const adminId = req.userId;
    
    const courses = await courseModel.find({
        creatorId: adminId
    })
    res.json({
        msg: 'Courses that are created by you', 
        courses
    })
})

module.exports = {
    adminRouter: adminRouter
}