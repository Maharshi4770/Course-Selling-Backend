require('dotenv').config()
console.log(process.env.JWT_USER_SECRET)

const express = require('express')
const app = express()
const {userRouter} = require("./Routes/user")
const {courseRouter} = require("./Routes/course")
const {adminRouter} = require("./Routes/admin")
const mongoose = require('mongoose')

app.use(express.json())

app.use("/user",userRouter);
app.use("/course",courseRouter);
app.use("/admin",adminRouter);

async function main(){
        await mongoose.connect(process.env.MONGO_URL)
        app.listen(3000)
        console.log("Listening on port 3000")
    }

main()