const signup = (req, res, next) => {
    res.send("Signup route");
};

const signin = (req, res, next) => {
    res.send("Signin route");
};

const signout = (req, res, next) => {
    res.send("Signout route");
};

export default {
    signup,
    signin,
    signout
};