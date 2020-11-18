import { IGoogleOauthProfile } from "google-oath-profile";
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
}, async (_accessToken: any, _refreshToken: any, profile: IGoogleOauthProfile, done: any) => {
  const user = await UserModel.findOrCreate({
    firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      auth: {
        email: profile.emails[0].value,
      },
      avatar: profile.photos.map((photo) => {
        return { url: photo.value } ;
      }),
      connections: {},
      connectionOf: {},
      threads: {
        started: {},
        commented: {},
        liked: {},
        shared: {},
      },
  });
  done(undefined, user);
}
);

export default GooglePassportStrategy;
