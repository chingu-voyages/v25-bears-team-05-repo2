import { IUser, IUserDocument, IUserModel } from "./user.types";

/**
 *
 * @param this *
 * @param data User data
 */
export async function findOneOrCreateByGoogleAuth(this: IUserModel, data: IUser): Promise<IUserDocument> {
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
