import {
  IUser,
  IUserDocument,
  IUserModel,
  IUserRegistrationDetails,
} from "../user.types";
import bcrypt from "bcryptjs";
import { decrypt } from "../../../utils/crypto";

/**
 * Find user by googleId, if not found, create user, populating with google
 * profile data
 * @param {object} this instance of IUserModel
 * @param {IUser} data User data
 */
export async function findOneOrCreateByGoogleId(
  this: IUserModel,
  data: IUser,
): Promise<IUserDocument> {
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
 * @param {object} this instance of IUserModel
 * @param {IUserRegistrationDetails} details
 * @return {Promise<IUserDocument>}
 */
export async function registerUser(
  this: IUserModel,
  details: IUserRegistrationDetails,
): Promise<IUserDocument> {
  const users = await this.findByEncryptedEmail(details.encryptedEmail);
  if (users && users.length > 0) {
    throw new Error(
      `User with email ${decrypt(details.encryptedEmail)} already exists`,
    );
  } else {
    // Create
    const hashedPassword = await bcrypt.hash(details.plainTextPassword, 10);
    return this.create({
      firstName: details.firstName,
      lastName: details.lastName,
      auth: {
        email: details.encryptedEmail,
        password: hashedPassword,
      },
      avatar: [{ url: "defaultAvatar" }],
      connections: {},
      threads: {
        started: {},
        commented: {},
        liked: {},
        shared: {},
      },
    });
  }
}

/**
 * Finds all instances of records with matching e-mail
 * @param {object} this reference to IUserModel object
 * @param {string} encryptedEmail e-mail in encrypted format
 * @return {Promise<IUserDocument[]>}
 */
export async function findByEncryptedEmail(
  this: IUserModel,
  encryptedEmail: string,
): Promise<IUserDocument[]> {
  const decryptedEmail = decrypt(encryptedEmail);
  const allRecords: IUserDocument[] = await this.find();
  return allRecords.filter((records) => {
    return decrypt(records.auth.email) === decryptedEmail;
  });
}

/**
 * Returns first instance of user with matching e-mail
 * @param {object} this reference to IUserModel object
 * @param {string} encryptedEmail e-mail in encrypted format
 * @return {Promise<IUserDocument>}
 */
export async function findOneByEncryptedEmail(
  this: IUserModel,
  encryptedEmail: string,
): Promise<IUserDocument> {
  const decryptedEmail = decrypt(encryptedEmail);
  const users = await this.find();

  for (const user of users) {
    if (decrypt(user.auth.email) === decryptedEmail) {
      return user;
    }
  }
}

/**
 *
 * @param {object} this
 * @param {string} newPlainTextPassword
 * @return {Promise<IUserDocument>}
 */
export async function changePassword(
  this: IUserDocument,
  newPlainTextPassword: string,
): Promise<IUserDocument> {
  const hashedNewPassword = bcrypt.hashSync(newPlainTextPassword);
  this.auth.password = hashedNewPassword;
  this.markModified("auth");
  return this.save();
}
