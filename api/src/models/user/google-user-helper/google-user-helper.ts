import { IGoogleOauthProfile } from "google-oath-profile";
import { IUser } from "../user.types";

export function createUserFromGoogleData (profile: IGoogleOauthProfile): IUser {
  return {
    firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      auth: {
        googleId: profile.id,
        email: profile.emails[0].value,
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
