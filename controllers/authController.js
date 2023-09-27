const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const sendEmail = require("../utils/email");

const signToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        httpOnly: true, expiresIn: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("jwt", token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: "success", token, data: {
            user,
        },
    });
};

exports.signup = async (req, res, next) => {
    let resp;
    try {
        resp = await User.create({
            name: req.body.name, email: req.body.email, password: req.body.password,
        });
        console.log(resp);
        createSendToken(resp, 201, res);

    } catch (err) {
        console.log(err);
        res.status(400).json({
            error: err
        })
    }
}

exports.login = async (req, res, next) => {
    const {email, password} = req.body;

    //    1 Check if email and password exists

    if (!email || !password) {
        return res.status(401).json({
            message: "Please provide email and password"
        })
    }

    //    2 Check if user exists && password is correct
    try {
        const user = await User.findOne({email}).select("+password");
        console.log(user)
        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                message: "Incorrect email or password"
            })
        }

        //    3 If everything is ok send the JWT

        return createSendToken(user, 200, res);
    } catch (error) {
        return res.status(400).json({
            error
        })
    }
}

exports.forgotPassword = async (req, res, next) => {
    //1 Get user based on POSTed email
    const user = await User.findOne({email: req.body.email});

    if (!user) {
        return res.status(404).json({
            message: "There is no user with that email address"
        })
    }

    //2 Generate a random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    //3 Send it to user's email
    const resetURL = `${process.env.PASSWORD_RESET_URL}/${resetToken}`;

    const message = `
        Forgot Your password? use the link to reset your password.        
        ${resetURL}
        If you didn't forgot your password please ignore the mail
        `;

    try {
        await sendEmail({
            email: user.email, subject: "Your password reset token valid for 3 min", message,
        });
        return res.status(200).json({
            status: "success", message: "Email send successfully please check your mail",
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        console.log(err);

        await user.save({validateBeforeSave: false});

        return res.status(500).json({
            status: "fail", message: "There was an error sending the E-mail try again later",
        });
    }
}

exports.resetPassword = async (req, res) => {
    //	1) Get the user based on the token
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()},
    });

    //	2) If token has not expired, and there is a user, set the new password

    if (!user) {
        return res.status(400).json({
            status: "failed", message: "Invalid token or token expired",
        })
    }

    //	3) Update changedPasswordAt property for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4) Log the user in/ Send the JWT
    // createSendToken(user, 200, res)

    return res.status(200).json({
        status: "success", message: "Password reset successful please log in",
    });
}

exports.updatePassword = async (req, res, next) => {
    //1) Get user from the collection
    const user = await User.findById(req.user.id).select("+password");

    //2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return res.status(400).json({
            status: 'failed',
            message: "Incorrect Password"
        });
    }

    //3) If so then update the password, and passwordChangedAt
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4) Log user in, send JWT
    createSendToken(user, 200, res);
}
