import passport from "passport";

const LocalStrategy = require("passport-local").Strategy;
import { UserModel } from "../models/user/user.model";
import bcrypt from "bcryptjs";

passport.serializeUser((user: any, done: any) => {
  done(undefined, user.id);
});

passport.deserializeUser((id: string, done: any) => {
  // done(undefined, user.id);
  UserModel.findById(id).then((user) => {
    done(undefined, user);
  }).catch((err) => {
    done(err, undefined);
  });
});

async function authenticateUser(email: string, password: string, done: any) {
  try {
    UserModel.findOne({ "auth.email" : email}).then((user) => {
      if (!user) {
        return done(undefined, false, { message: `User with ${email} not found`});
      }

     bcrypt.compare(password, user.auth.password).then((result) => {
      if (result === true) {
        return done(undefined, user);
      } else {
        return done(undefined, undefined, { message: "Invalid username or password"});
      }
     }).catch((err) => {
       return done(err, undefined, {message: "Unable to authenticate user"});
     });
    });
  } catch (err) {
    done(err, undefined);
  }
}
const LocalPassportStrategy = new LocalStrategy({
  usernameField: "email"
}, authenticateUser);

export default LocalPassportStrategy;
