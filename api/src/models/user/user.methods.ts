import { IUser, IUserDocument,
  IUserModel, IUserRegistrationDetails } from "./user.types";
import bcrypt from "bcryptjs";
/**
 * Find user by googleId, if not found, create user, populating with google
 * profile data
 * @param this *
 * @param data User data
 */
export async function findOneOrCreateByGoogleId(this: IUserModel, data: IUser): Promise<IUserDocument> {
  const documents = await this.find({ "auth.googleId": data.auth.googleId });
  if (documents && documents.length > 0) {
    return documents[0];
  }
  // If not found, create
  try {
    const newUserEntry = await this.create(data);
    return newUserEntry;
  } catch (err) {
    console.log(err);
  }
}

/**
 * Finds user by google id
 * @param this
 * @param id google id
 */
export async function findByGoogleId(this: IUserModel, id: string): Promise<IUserDocument> {
  try {
    return await this.findOne({ "auth.googleId": id});
  } catch (err) {
    console.log(err);
  }
}

/**
 *  Registers user. Checks to ensure e-mail address is unique
 */
export async function registerUser(this: IUserModel, details: IUserRegistrationDetails) {
    const users = await this.find({ "auth.email" : details.email });
    if (users && users.length > 0) {
      throw new Error(`User with email ${details.email} already exists`);
    } else {
      // Create
      const hashedPassword = await bcrypt.hash( details.plainTextPassword, 10);
      const newUser = await this.create({
        firstName: details.firstName,
        lastName: details.lastName,
        auth: {
          email: details.email.toLowerCase(),
          password: hashedPassword
        },
        avatar: [{ url: "defaultAvatar"}],
        connections: {},
        connectionOf: {},
        threads: {
          started: {},
          commented: {},
          liked: {},
          shared: {}
        }
      });
      return newUser;
    }
}
