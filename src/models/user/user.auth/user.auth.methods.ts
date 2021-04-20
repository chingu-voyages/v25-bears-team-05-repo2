import { IUser, IUserDocument,
  IUserModel, IUserRegistrationDetails } from "../user.types";
import bcrypt from "bcryptjs";
import { decrypt } from "../../../utils/crypto";

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
 *  Registers user. Checks to ensure e-mail address is unique
 */
export async function registerUser(this: IUserModel, details: IUserRegistrationDetails) {
    const users = await this.findByEncryptedEmail(details.encryptedEmail);
    if (users && users.length > 0) {
      throw new Error(`User with email ${decrypt(details.encryptedEmail)} already exists`);
    } else {
      // Create
      const hashedPassword = await bcrypt.hash( details.plainTextPassword, 10);
      const newUser = await this.create({
        firstName: details.firstName,
        lastName: details.lastName,
        auth: {
          email: details.encryptedEmail,
          password: hashedPassword
        },
        avatar: [{ url: "defaultAvatar"}],
        connections: { },
        connectionOf: { },
        threads: {
          started: { },
          commented: { },
          liked: { },
          shared: { }
        }
      });
      return newUser;
    }
}

/**
 * Finds all instances of records with matching e-mail
 * @param this reference to IUserModel object
 * @param encryptedEmail e-mail in encrypted format
 */
export async function findByEncryptedEmail (this: IUserModel, encryptedEmail: string): Promise<IUserDocument[]> {
  const decryptedEmail = decrypt(encryptedEmail);
  const allRecords: IUserDocument[] = await this.find();
  return allRecords.filter((records) => {
    return decrypt(records.auth.email) === decryptedEmail;
  });
}

/**
 * Returns first instance of record with matching e-mail
 * @param this reference to IUserModel object
 * @param encryptedEmail e-mail in encrypted format
 */
export async function findOneByEncryptedEmail (this: IUserModel, encryptedEmail: string) {
  const decryptedEmail = decrypt(encryptedEmail);
  const allRecords = await this.find();

  for (let i = 0; i < allRecords.length; i++) {
    if (decrypt(allRecords[i].auth.email) === decryptedEmail) {
      return allRecords[i];
    }
  }
}
