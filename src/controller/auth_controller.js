const user = require('../db/user');
const User = require('../db/user');

exports.RegisterUser = async(req, res) => {
    const user = new User(req.body);
    await user.save((err, doc) => {
        if (err) {
            console.log(err);
            return res.status(422).json({ errors: err })
        } else {
            const userData = {
                firtsName: doc.firstName,
                lastName: doc.lastName,
                username: doc.username,
            }
            return res.status(200).json({
                success: true,
                message: 'Successfully Signed Up',
                userData
            })
        }
    });
};

exports.LoginUser = (req, res) => {
    User.findOne({ 'username': req.body.username }, (err, user) => {
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found!' });
        } else {
            user.comparePassword(req.body.password, (err, isMatch) => {
                console.log(isMatch);
                //isMatch is eaither true or false
                if (!isMatch) {
                    return res.status(400).json({ success: false, message: 'Wrong Password!' });
                } else {
                    user.generateToken((err, user) => {
                        if (err) {
                            return res.status(400).send({ err });
                        } else {
                            const data = {
                                    userID: user._id,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    username: user.username,
                                    token: user.token
                                }
                                //saving token to cookie
                            res.cookie('authToken', user.token).status(200).json({
                                success: true,
                                message: 'Successfully Logged In!',
                                userData: data
                            })
                        }
                    });
                }
            });
        }
    });
};

exports.LogoutUser = (req, res) => {
    User.findByIdAndUpdate({ _id: req.user._id }, { token: '' },
        (err) => {
            console.log('entered logout');
            if (err) return res.json({ success: false, err })
            console.log('logging out');
            return res.cookie('authToken', '', { maxAge: 1 }).status(200).send({ success: true, message: 'Successfully Logged Out!' });
        })
};

//get authenticated user details
exports.getUserDetails = (req, res) => {
    return res.status(200).json({
        isAuthenticated: true,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username,
    });
};