import { IProfileData, IUser, IUserDocument,
  IUserModel, IUserRegistrationDetails } from "./user.types";
import bcrypt from "bcryptjs";
import { decrypt } from "../../utils/crypto";
import { UserModel } from "./user.model";
import { IUserConnection } from "../user-connection/user-connection.types";
import { IThread, IThreadPostDetails } from "../thread/thread.types";
import { ThreadModel } from "../thread/thread.model";
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

/**
 * Finds all instances of records with matching e-mail
 * @param this reference to IUserModel object
 * @param encryptedEmail e-mail in encrypted format
 */
export async function findByEncryptedEmail (this: IUserModel, encryptedEmail: string): Promise<IUserDocument[]> {
  const decryptedEmail = decrypt(encryptedEmail);
  const allRecords = await this.find();
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

/**
 *  Adds a connection object to user's profile and updates the connectionOf property
 * on the target.
 * @param this *
 * @param objId object id
 */
export async function addConnectionToUser (this: IUserDocument, objId: string, isTeamMate?: boolean): Promise<IUserDocument> {
  // This assumes we already have the home user document in context with "this"
  try {
    const targetUser = await UserModel.findById(objId);
    if (targetUser) {
      const targetUserConnection = transformUserDataToConnection(targetUser, isTeamMate); // Adds to originator's connections object
      const originatorConnection = transformUserDataToConnection(this, isTeamMate); // Adds to target;s connectionsOf object

      this["connections"][targetUser._id] = targetUserConnection;
      targetUser["connectionOf"][this._id] = originatorConnection;

      // Saves the changes
      await this.save();
      await targetUser.save();
      return targetUser;
    } else {
      throw new Error("User id not found");
    }
  } catch (err) {
    console.log(err);
  }
}

/**
 * Removes connection from user and any subsequent users affected.
 * @param this
 * @param objId
 */
export async function deleteConnectionFromUser(this: IUserDocument, objId: string): Promise<IUserDocument> {
  try {
    const targetUser = await UserModel.findById(objId);
    if (targetUser) {
      delete this["connections"][targetUser._id];
      delete targetUser["connectionOf"][this._id];
      await this.save();
      await targetUser.save();
      return targetUser;
    } else {
      throw new Error("User id not found");
    }
  } catch (err) {
    console.log(err);
  }
}

export async function updateUserProfile(this: IUserDocument, profileData: IProfileData): Promise<IUserDocument> {
  if (profileData.firstName) {
    this.firstName = profileData.firstName;
  }
  if (profileData.lastName) {
    this.lastName = profileData.lastName;
  }
  if (profileData.jobTitle) {
    this.jobTitle = profileData.jobTitle;
  }
  if (profileData.avatarUrl) {
    const elementExists = this.avatar.find((element) => {
      return element.url === profileData.avatarUrl;
    });
    if (!elementExists) {
      this.avatar.unshift( { url: profileData.avatarUrl} );
    }
  }
  try {
    return await this.save();
  } catch (err) {
    console.log(err);
  }
}

/**
 *
 * @param this instance of IUserDocument
 * @param threadDetails data used to make a thread
 */
export async function createAndPostThread(this: IUserDocument, threadDetails: IThreadPostDetails) {
  const userThread: IThread = {
    threadType: threadDetails.threadType,
    visibility: threadDetails.visibility,
    postedByUserId: this.id,
    content: {
      html: threadDetails.html,
      attachments: threadDetails.attachments,
      hashTags: threadDetails.hashTags
    },
    comments: {},
    likes: {},
    shares: {}
  };
  try {
    const newlyCreatedThread = await ThreadModel.create(userThread);
    this.threads.started[`${newlyCreatedThread.id.toString()}`] = newlyCreatedThread;
    await this.save();
    return [this, newlyCreatedThread];
  } catch (err) {
    console.log(err);
  }

}

/**
 *
 * @param userData A user document to transform
 * @param isTeamMate optional flag to indicate if teammate.
 */
function transformUserDataToConnection(userData: IUserDocument, isTeamMate?: boolean): IUserConnection {
  return {
    firstName: userData.firstName,
    lastName: userData.lastName,
    avatar: userData.avatar,
    isTeamMate: isTeamMate || false,
  };
}

