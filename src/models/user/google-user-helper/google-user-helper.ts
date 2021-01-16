import { IGoogleOauthProfile } from "google-oath-profile";
import { IUser } from "../user.types";
import { encrypt } from "../../../utils/crypto";

export function createUserFromGoogleData (profile: IGoogleOauthProfile): IUser {
  return {
    firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      auth: {
        googleId: profile.id,
        email: encrypt(profile.emails[0].value.toLowerCase()),
        oauth: profile.accessToken
      },
      avatarUrls: profile.photos.map((photo) => {
        return { url: photo.value } ;
      }),
      connections: {},
      connectionOf: {},
      threads: {
        started: {},
        commented: {},
        reacted: {},
        forked: {},
      },
      createdAt: new Date(),
      updatedAt: new Date()
  };
}
