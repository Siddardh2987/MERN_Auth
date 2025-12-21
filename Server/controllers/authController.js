import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
// import transporter from '../config/nodemailer.js';
import nodemailer from 'nodemailer';

export const register = async (req , res) => {
    const {name , email , password} = req.body;
    if(!name || !email || !password){
        return res.json({success : false , message : "Missing Details."})
    }
    try{
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.json({success : false , message : "User already exists."})
        }
        const hashedPassword = await bcrypt.hash(password , 10);
        const user = new userModel({
            name,
            email,
            password : hashedPassword
        });
        await user.save();

        const token = jwt.sign({userId : user._id} , process.env.JWT_SECRET , {expiresIn : '1d'});
        res.cookie('token' , token , {
            httpOnly : true,
            secure : process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV === 'production'? 'none' : 'strict',
            maxAge : 24 * 60 * 60 * 1000 // 1day in ms , our jwt token expiry is 1 day
        });

        // This is the actual code to send email using brevo service but we need to get verified sender email first so commenting it for now.
        // const mailOptions = {
        //     from: process.env.SENDER_EMAIL,
        //     to : user.email,
        //     subject : 'Welcome to Our Website!',
        //     text : `Hello ${user.name},\n\nThank you for registering on our website. We're excited to have you on board!\n\nBest regards.`
        // }
        // // console.log("Sending Email to " + user.email);
        // await transporter.sendMail(mailOptions);
        
        // For testing purpose we will use ethereal email service from nodemailer, From here .
        async function sendMail() {
            let testAccount = await nodemailer.createTestAccount();

            let transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            let info = await transporter.sendMail({
                from: '"Test" <test@example.com>',
                to: "user@example.com",
                subject: "Hello",
                text: "Learning email system 🚀",
            });
            console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
        }
        sendMail();
        // Till here .

        return res.json({success : true, message : "User registered successfully."})
    }catch(error){
        return res.json({success : false, message : error.message + " authController Register."})
    }
}

export const login = async (req , res) => {
    const {email , password} = req.body;
    if(!email || !password){
        return res.json({success : false , message : "Missing Details."})
    }
    try{
        const existingUser = await userModel.findOne({email});
        if(!existingUser){
            return res.json({success : false , message : "User doesn't exists."})
        }
        const isMatch = await bcrypt.compare(password , existingUser.password);
        if(!isMatch){
            return res.json({success : false , message : "Invalid Credentials."})
        }
        const token = jwt.sign({userId : existingUser._id} , process.env.JWT_SECRET , {expiresIn : '1d'});
        res.cookie('token' , token , {
            httpOnly : true,
            secure : process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV === 'production'? 'none' : 'strict',
            maxAge : 24 * 60 * 60 * 1000 // 1day in ms , our jwt token expiry is 1 day
        });
        return res.json({success : true, message : "User logged in successfully."})
    }catch(error){
        return res.json({success : false, message : error.message + " authController Login."})
    }
}

export const logout = async (req,res) => {
    try{
        res.clearCookie('token' , {
            httpOnly : true,
            secure : process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV === 'production'? 'none' : 'strict',
        });

        return res.json({success : true, message : "User logged out successfully."});

    }catch(error){
        return res.json({success : false, message : error.message + " authController Logout."});
    }
}

export const sendVerifyOtp = async (req , res) => {
    try{
        const {userId} = req.body;
        const user = await userModel.findById(userId);
        
        if(user.isAccountVerified){
            return res.json({success : false, message : "Account already verified."});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now
        await user.save();


        // This is the actual code to send email using brevo service but we need to get verified sender email first so commenting it for now.
        // const mailOptions = {
        //     from: process.env.SENDER_EMAIL,
        //     to : user.email,
        //     subject : 'Verification OTP',
        //     text : `Hello ${user.name},\n\nYour OTP for account verification is ${otp}. It is valid for 10 minutes.\n\nBest regards.`
        // }
        // // console.log("Sending Email to " + user.email);
        // await transporter.sendMail(mailOptions);

        // For testing purpose we will use ethereal email service from nodemailer, From here .
        async function sendMail() {
            let testAccount = await nodemailer.createTestAccount();

            let transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            let info = await transporter.sendMail({
                from: '"Test" <test@example.com>',
                to: "user@example.com",
                subject: "OTP Verification",
                text: `Your OTP is ${otp}. Please use this to verify your account.`,
            });
            console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
            console.log(`OTP for ${user.email} is ${otp}`);
        }
        sendMail();
        // Till here .
        return res.json({success : true, message : "OTP sent to your email."});
    }catch(error){
        return res.json({success : false, message : error.message + " authController Send Verify OTP."});
    }
}

export const verifyEmail = async (req , res) => {
    const {userId , otp} = req.body;

    if(!userId || !otp){
        return res.json({success : false, message : "Missing Details."});
    }
    try{
        const user = await userModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success : false, message : "Account already verified."});
        }

        if(user.verifyOtp !== otp){
            return res.json({success : false, message : "Invalid OTP."});
        }

        if(Date.now() > user.verifyOtpExpiry){
            return res.json({success : false, message : "OTP expired."});
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpiry = 0;
        await user.save();

        return res.json({success : true, message : "Account verified successfully."});

    }catch(error){
        return res.json({success : false, message : error.message + " authController Verify Email."});
    }
}

export const isAuthenticated = (req , res) => {
    try{
        return res.json({success : true});
    }catch(error){
        return res.json({success : false, message : error.message + " authController isAuthenticated."});
    }
}

// Passsword reset.

export const sendResetOtp = async (req , res) => {
    const {email} = req.body;
    if(!email){
        return res.json({success : false, message : "Missing Details."});
    }
    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success : false, message : "User not found."});
        }
        
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes from now
        await user.save();


        // This is the actual code to send email using brevo service but we need to get verified sender email first so commenting it for now.
        // const mailOptions = {
        //     from: process.env.SENDER_EMAIL,
        //     to : user.email,
        //     subject : 'Verification OTP',
        //     text : `Hello ${user.name},\n\nYour OTP for account verification is ${otp}. It is valid for 10 minutes.\n\nBest regards.`
        // }
        // // console.log("Sending Email to " + user.email);
        // await transporter.sendMail(mailOptions);

        // For testing purpose we will use ethereal email service from nodemailer, From here .
        async function sendMail() {
            let testAccount = await nodemailer.createTestAccount();

            let transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            let info = await transporter.sendMail({
                from: '"Test" <test@example.com>',
                to: "user@example.com",
                subject: "OTP Verification",
                text: `Your OTP is ${otp}. Please use this to Reset your password.`,
            });
            console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
            console.log(`OTP for ${user.email} is ${otp}`);
        }
        sendMail();
        // Till here .
        return res.json({success : true, message : "OTP sent to your email."});
    }catch(error){
        return res.json({success : false, message : error.message + " authController Send Reset OTP."});
    }
}

export const resetPassword = async (req , res) => {
    const {email , otp , newPassword} = req.body;
    if(!email || !otp || !newPassword){
        return res.json({success : false, message : "Missing Details."});
    }
    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success : false, message : "User not found."});
        }
        if(user.resetOtp !== otp){
            return res.json({success : false, message : "Invalid OTP."});
        }
        if(Date.now() > user.resetOtpExpiry){
            return res.json({success : false, message : "OTP expired."});
        }
        const hashedPassword = await bcrypt.hash(newPassword , 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpiry = 0;

        await user.save();
        
        return res.json({success : true, message : "Password reset successfully."});
    }catch(error){
        return res.json({success : false, message : error.message + " authController Reset Password."});
    }
}