import passport from "passport";

const LocalStrategy = require("passport-local").Strategy;
import { UserModel } from "../models/user/user.model";

passport.serializeUser((user: any, done: any) => {
  done(undefined, user.id);
});

async function authenticateUser(email: string, password: string, done: any) {
  try {
    // UserModel.find({ "auth.email": email }).then((user))
  } catch (err) {
    done(err, undefined);
  }
}
const LocalPassportStrategy = new LocalStrategy({
  usernameField: "email"
}, authenticateUser);

export default LocalPassportStrategy;
