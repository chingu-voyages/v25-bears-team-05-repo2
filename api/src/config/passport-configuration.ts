import passport from "passport";
const GoogleStrategy = require("passport-google-oauth20").Strategy;
import { UserModel } from "../models/user/user.model";

passport.serializeUser(function(user: any, done: any) {
  done(undefined, user.id);
});

passport.deserializeUser(function(_id, done) {
  // UserModel.findById(id, function(err, user) {
  //   done(err, user);
  // });
  // done(undefined, user);
});

const GooglePassportStrategy = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.DEV_AUTH_CALLBACK_URL
}, (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
  console.log("Line 21", profile);
  // UserModel.findOrCreate({ googleId: profile.id }, function (err, user) {
  //   return done(err, user);
  // });
  done(undefined, profile);
}
);

export default GooglePassportStrategy;
