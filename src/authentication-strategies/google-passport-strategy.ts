import { IGoogleOauthProfile } from "google-oath-profile";
import passport from "passport";

import { createUserFromGoogleData } from "../models/user/google-user-helper/google-user-helper";
const GoogleStrategy = require("passport-google-oauth20").Strategy;
import { UserModel } from "../models/user/user.model";

passport.serializeUser((user: any, done: any) => {
  done(undefined, user.id);
});

passport.deserializeUser((id: string, done) => {
  UserModel.findById(id).then((user) => {
    done(undefined, user);
  }).catch((err) => {
    done(err, undefined);
  });
});

async function authenticateUser(_accessToken: any, _refreshToken: any, profile: IGoogleOauthProfile, done: any) {
  try {
    const user = await UserModel.findOneOrCreateByGoogleId(createUserFromGoogleData(profile));
    done(undefined, user);
  } catch (err) {
    done(err, undefined);
  }
}

const GooglePassportStrategy = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.NODE_ENV === "production" ? process.env.API_URL : process.env.DEV_API_URL}/auth/google/callback`
}, authenticateUser);

export default GooglePassportStrategy;
