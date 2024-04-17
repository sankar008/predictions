const { sign } = require("jsonwebtoken");
const { genSaltSync, hashSync, compareSync } = require('bcrypt');
const { auth } = require("../../auth/jwt_token");
const userModel = require("./user.service");
var nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config()


const createUser = async (req, res) => {
    const body = req.body;
    try {
        let type = body.type;

        if (type == 'email') {
            let isDuplicate = await userModel.find({ emailId: body.emailId }).count();
            if (isDuplicate > 0) {
                return res.status(400).json({
                    success: false,
                    data: [],
                    message: "Email already registered!!"
                })
            }
            const salt = genSaltSync(10);
            body.password = hashSync(body.password, salt);
            body.otp = Math.random().toString().substr(2, 5);


            to = body.emailId
            subject = "Email Verification"
            emailbody = "Your email verification code is " + body.otp
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER_NAME,
                    pass: process.env.SMTP_PASSWORD
                }
            });
            var mailOptions = {
                from: `Predibets<${process.env.SMTP_USER_NAME}>`,
                to: body.emailId,
                subject: subject,
                text: emailbody
            };

            const user = new userModel({
                emailId: body.emailId,
                type: body.type,
                password: body.password,
                name: body?.name,
                profile_pic: body?.profile_pic,
                fcm_token: body.fcm_token,
                otp: body.otp,
                isVerified: 0
            })

            var modelData = await user.save();

            transporter.sendMail(mailOptions, function (error, info) {
                return res.status(200).json({
                    success: true,
                    data: { emailId: body.emailId },
                    message: "Registration successfully!"
                })
            });
        } else if (type == 'google') {
            let isDuplicate = await userModel.findOne({ emailId: body.emailId });
            if (isDuplicate !== null) {
                let jsontoken = sign({ result: isDuplicate }, 'predibets', {
                    expiresIn: "12d"
                });
                return res.status(200).json({
                    success: true,
                    data: isDuplicate,
                    token: jsontoken,
                    message: "Email already registered!!"
                })
            }


            const user = new userModel({
                emailId: body.emailId,
                type: body.type,
                name: body?.name,
                profile_pic: body?.profile_pic,
                fcm_token: body.fcm_token,
                isVerified: 1
            })
            var modelData = await user.save();
            let jsontoken = sign({ result: modelData }, 'predibets', {
                expiresIn: "12d"
            });

            return res.status(200).json({
                success: true,
                data: modelData,
                token: jsontoken,
                message: "Registration successfully!"
            })

        } else if (type == 'apple') {
            let isDuplicate = await userModel.findOne({ emailId: body.emailId });

            if (isDuplicate !== null) {
                let jsontoken = sign({ result: isDuplicate }, 'predibets', {
                    expiresIn: "12d"
                });
                return res.status(200).json({
                    success: true,
                    data: isDuplicate,
                    token: jsontoken,
                    message: "Email already registered!!"
                })
            }


            const user = new userModel({
                emailId: body.emailId,
                type: body.type,
                name: body?.name,
                profile_pic: body?.profile_pic,
                fcm_token: body.fcm_token,
                isVerified: 1
            })
            var modelData = await user.save();
            let jsontoken = sign({ result: isDuplicate }, 'predibets', {
                expiresIn: "12d"
            });

            return res.status(200).json({
                success: true,
                data: modelData,
                token: jsontoken,
                message: "Registration successfully!"
            })

        } else {
            return res.status(400).json({
                success: false,
                data: [],
                message: "Type is a require field!"
            })
        }

    } catch (e) {
        const error = e.errors;
        return res.status(400).json({
            success: false,
            message: error
        })
    }
}

const emailVerification = async (req, res) => {
    const body = req.body;
    const user = await userModel.findOne({ emailId: body.emailId, otp: body.otp })

    if (user) {
        const updateuser = await userModel.updateOne({ emailId: body.emailId }, {
            isVerified: "1"
        });

        const jsontoken = sign({ result: user }, 'predibets', {
            expiresIn: "12d"
        });
        return res.status(200).json({
            success: true,
            token: jsontoken,
            message: "OTP verified!"
        })

    } else {
        return res.status(400).json({
            success: false,
            message: "OTP doest not match!"
        })
    }
}

const forgotPassword = async (req, res) => {
    const body = req.body;

    const checkuser = await userModel.findOne({ emailId: body.emailId});
    if (checkuser) {
        if(checkuser.type == 'google' || checkuser.type == 'apple'){
            return res.status(400).json({
                success: false,
                message: "Email id does not registered as a email account"
            })
        }

        body.otp = Math.random().toString().substr(2, 6);
        to = body.emailId
        subject = "Reset password"
        emailbody = "Your reset password otp is " + body.otp

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER_NAME,
                pass: process.env.SMTP_PASSWORD
            }
        });

        var mailOptions = {
            from: `Predibets<${process.env.SMTP_USER_NAME}>`,
            to: body.emailId,
            subject: subject,
            text: emailbody
        };

        const student = await userModel.updateOne({ emailId: body.emailId }, {
            otp: body.otp
        });

        transporter.sendMail(mailOptions, function (error, info) {
            return res.status(200).json({
                success: true,
                message: "OTP sent to registered email id!"
            })
        });

    } else {
        return res.status(400).json({
            success: false,
            message: "Email id does not match"
        })
    }
}

const resetPassword = async (req, res) => {
    const body = req.body;

    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);

    const otpver = await userModel.find({ emailId: body.emailId, otp: body.otp }).count();
    if (otpver) {

        const p = await userModel.updateOne({ emailId: body.emailId, otp: body.otp }, { password: body.password });

        if (p.modifiedCount == 1) {
            return res.status(200).json({
                success: true,
                message: "Password changed successfully"
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "Error!! Please try again"
            })
        }

    } else {
        return res.status(400).json({
            success: false,
            message: "Invaid otp. Please resend."
        })
    }
}

const login = async (req, res) => {
    const body = req.body;
    try {
        const student = await userModel.findOne({ emailId: body.emailId }, { password: 1, _id: 1, emailId: 1, name: 1, isVerified:1 });
        if(student?.isVerified == 0){
            return res.status(400).json({
                success: false,
                message: "Email id yet not verified."
            })
        }
        if (student) {

            const encryresult = compareSync(body.password, student.password);

            if (encryresult === true) {
                const jsontoken = sign({ result: student }, 'predibets', {
                    expiresIn: "12d"
                });
                return res.status(200).json({
                    success: true,
                    data: { emailId: student.emailId },
                    token: jsontoken
                })
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Password doest not match!"
                })
            }

        } else {
            return res.status(400).json({
                success: false,
                message: "Registered Email Id is require."
            })
        }
    } catch (e) {
        return res.status(400).json({
            success: false,
            message: e
        })
    }
}

const resetOtp = async (req, res) => {
    const body = req.body;
    try {

        body.otp = Math.random().toString().substr(2, 5);
        to = body.emailId
        subject = "Reset OTP"
        emailbody = "Your email verification code is " + body.otp
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER_NAME,
                pass: process.env.SMTP_PASSWORD
            }
        });
        var mailOptions = {
            from: `Predibets<${process.env.SMTP_USER_NAME}>`,
            to: body.emailId,
            subject: subject,
            text: emailbody
        };


        var modelData = await userModel.updateOne({ emailId: body.emailId }, { otp: body.otp });

        transporter.sendMail(mailOptions, function (error, info) {
            return res.status(200).json({
                success: true,
                message: "OTP Send successfully!"
            })
        });

    } catch (e) {
        const error = e.errors;
        return res.status(400).json({
            success: false,
            message: error
        })
    }
}

const getUserById = async (req, res) => {
    try {
        const authData = await auth(req.token_code);
        const user = await userModel.find({ _id: new mongoose.Types.ObjectId(authData.result._id) })
        const userData = user.map(function (e) {
            e.profile_image = e.type == 'email'? process.env.IMAGE_PATH + '/' + e.profile_image : e.profile_image
            return e;
        })
        return res.status(200).json({
            success: true,
            data: userData[0]
        })
    } catch (e) {
        const error = e.errors;
        return res.status(400).json({
            success: false,
            message: error
        })
    }
}

const updateUserById = async (req, res) => {
    const body = req.body;
    try {
        const authData = await auth(req.token_code);
        var updateData = {
            name: body.name,
            fcm_token: body.fcm_token,
        }
        if(req.file){
            var updateData = {
                name: body.name,
                fcm_token: body.fcm_token,
                profile_image: req.file.path
            }
        }

        const user = await userModel.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(authData.result._id) }, updateData);

        return res.status(200).json({
            success: true,
            data: await userModel.findOne({ _id: new mongoose.Types.ObjectId(authData.result._id) }),
            message: "Data updated successfully!!"
        })

    } catch (e) {
        const error = e.errors;
        return res.status(400).json({
            success: false,
            message: error
        })
    }
}

const deleteUser = async (req, res) => {
    try{
        const authData = await auth(req.token_code);
        const user = await userModel.findOneAndDelete({_id:new mongoose.Types.ObjectId(authData.result._id)})
        return user?res.status(200).json({
            success: true,
            msg: "Data has been deleted successfully."
        }):res.status(200).json({
            success: 0,
            msg: "Delete error. Please try again."
        });
    }catch(e){
        return res.status(400).json({
            success: 0,
            msg: e
        });
    }
}

const changePassword = async (req, res) => {
    const body = req.body;
    try{
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);
        const authData = await auth(req.token_code);
        const p = await userModel.updateOne({ _id: new mongoose.Types.ObjectId(authData.result._id) }, { password: body.password });
        return res.status(200).json({
            success: true,
            message: "Password change successfully!!"
        })
    }catch (e) {
        return res.status(400).json({
            success: false,
            message: e
        })
    }

    
}


module.exports = {
    createUser: createUser,
    login: login,
    emailVerification: emailVerification,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    resetOtp: resetOtp,
    getUserById: getUserById,
    updateUserById: updateUserById,
    deleteUser: deleteUser,
    changePassword: changePassword 
}


