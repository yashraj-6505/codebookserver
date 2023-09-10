const User = require("../models/UserSchema");
require("dotenv").config();
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");


const register = async (req, res) => {
    console.log("hello")

    var { name, email, password, } = req.body;
    if (!name || !email || !password)
      res.status(422).send("Enter all fields");
    try {
      const userExists = await User.findOne({ email: email });
      if (userExists) {
        res.status(422).send("User with this email already exists");
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        password = hashedPassword;
        const user = new User({ name, email, password });
        const saveUser = await user.save();
        if (saveUser) res.status(200).send("User created successfully");
      }
    } catch (error) {
      console.log("Error", error);
    }
    
  };

  
  const login = async (req, res) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res
          .status(200)
          .send({ ok: false, message: "Email or password cannot be blank" });
      }
      const userLogin = await User.findOne({ email: email });
      if (userLogin) {
        const isValid = await bcrypt.compare(password, userLogin.password);
        if (!isValid) {
          res.status(200).json({ ok: false, message: "Incorrect Credentials" });
        } else {
          const token = jwt.sign(
            {
              _id: userLogin._id,
              name: userLogin.name,
            },
            process.env.JWT_PRIVATE_KEY,
            {
              expiresIn: "14000000m",
            }
          );
          return res
            .status(200)
            .json({ ok: true, message: "Login Successfull!", token, userLogin });
        }
      } else {
        res.status(200).send({ ok: false, message: "User does not exist" });
      }
    } catch (error) {
      console.log(error);
    }
  };


  module.exports={
    register,
    login
  };
  

  