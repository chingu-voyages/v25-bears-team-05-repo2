import { IGoogleOauthProfile } from "google-oath-profile";
import { IUser } from "../user.types";
import cryptoJs from "crypto-js/sha256";

export function createUserFromGoogleData (profile: IGoogleOauthProfile): IUser {
  return {
    firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      auth: {
        googleId: profile.id,
        email: profile.emails[0].value.toLowerCase(),
        oauth: profile.accessToken
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
  };
}
