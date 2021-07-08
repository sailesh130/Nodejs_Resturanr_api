var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config.js');
const Dishes = require('./models/dishes');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;
exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));
function verifyadmin(req,res,next){
    const admin = req.user.admin;
    if(admin){
        next();
    }
    else{
        const err = new Error("You are not authorize to perform this operation");
        res.statusCode = 403;
        next(err);
    }
}
function verifycomment(req,res,next){
    const user = req.user.username;
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
       
       if (user == dish.comments.id(req.params.commentId).author.username){
            next();
       }
        else{
                if(req.method == 'DELETE')
                {
                   err = new Error("You are not authorized to delete this comment") 
                   next(err);
                }
                else if(req.method == 'PUT'){
                    err = new Error("You are not authorized to update this comment") 
                   next(err);
                }

                
        }

    },(err)=>next(err))
    .catch((err)=>next(err));

            
}

exports.verifyUser = passport.authenticate('jwt', {session: false});
exports.verifyAdmin = verifyadmin;
exports.verifyComment = verifycomment;