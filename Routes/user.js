const {Router} = require ('express');
const jwt = require ('jsonwebtoken');
const {z} = require ('zod');
const mongoose = require ('mongoose');
const {userModel, courseModel, purchaseModel} = require ('../db');
const userRouter = Router ();
const {JWT_USER_SECRET} = require("../config")
const {string, email} = require ('zod/v4');
const bcrypt = require ('bcrypt');
const { usermiddleware } = require('../middleware/user')

mongoose.connect ('mongodb://localhost:27017/CourseSelling');

//Now i don't need to write "/user" bec. i have written in the server.js file where i import this
userRouter.post ('/signup', async function (req, res) {
  const requirebody = z.object ({
    email: z.string ().email ().max (30),
    firstName: z.string ().min (3).max (10),
    lastName: z.string ().min (3).max (10),
    password: z
      .string ()
      .min (8, {message: 'Password must be at least 8 characters long'})
      .max (13, {message: 'Password must be at most 13 characters long'})
      .refine (val => /[a-z]/.test (val), {
        message: 'Must include a lowercase letter',
      })
      .refine (val => /[A-Z]/.test (val), {
        message: 'Must include an uppercase letter',
      })
      .refine (val => /[^A-Za-z0-9]/.test (val), {
        message: 'Must include a special character',
      }),
  });

  const {success, data, error} = requirebody.safeParse (req.body);

  if (!success) {
    return res.json ({
      msg: 'Incorrect Format',
      error: error,
    });
  }

  const {email, firstName, lastName, password} = req.body;

  try {
    const hashedpassword = await bcrypt.hash (password, 5);
    await userModel.create ({
      email,
      firstName,
      lastName,
      password: hashedpassword,
    });

    return res.json ({
      msg: 'You are signedUp',
    });
  } catch (e) {
    return res.json ({
      msg: 'User already exists',
    });
  }
}); 

userRouter.post ('/signin', async function (req, res) {
  const {email, password} = req.body;

  const user = await userModel.findOne ({
    email: email,
  });

  if (!user) {
    res.status (202).json ({
      msg: 'User is not availabale',
    });
    return;
  }

  const passwordmatch = await bcrypt.compare (password, user.password);

  if (passwordmatch) {
    const token = jwt.sign (
      {
        id: user._id,
      },
      JWT_USER_SECRET
    );

    res.json ({token: token});
  } else {
    res.json ({
      msg: 'Incorrect login credentials',
    });
  }
});

userRouter.get ('/purchases',usermiddleware, async function (req, res) {
  const userId = req.userId;
 
  const purchases = await purchaseModel.find({
    userId,
  })
  console.log(userId);
  let purchasedID = [];

  for(let i=0;i<purchases.length;i++){
    purchasedID.push(purchases[i].courseId)
  }

  const courseData = await courseModel.find({
    _id: { $in: purchases.map(x=>x.courseId)}
    
  })
  res.json ({
    purchases,
    courseData
  });
});

module.exports = {
  userRouter: userRouter,
};