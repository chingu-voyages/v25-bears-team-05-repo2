import { IUser, IUserModel } from "./user.types";

/**
 * Searches for a document by googleId, if not found, creates
 * @param this
 * @param id GoogleId
 */
export async function findOrCreate(this: IUserModel, data: IUser) {
  const documents = await this.find({ googleId: data.auth.googleId });

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
