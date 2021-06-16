/* eslint-disable no-invalid-this */
import { IUserDocument, IProfileData } from "../user.types";

/**
 *
 * @param {IUserDocument} this user instance
 * @param {IProfileData} profileData
 * @return {Promise<IUserDocument>}
 */
export async function updateUserProfile(this: IUserDocument,
  profileData: IProfileData): Promise<IUserDocument> {
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
      this.avatar.unshift( { url: profileData.avatarUrl } );
    }
  }
  return this.save();
}

/**
 * Returns concatenated first and last names for the user document
 * @param {IUserDocument} this instance of user document
 * @return {string} firstName and lastName concatenated
 */
export function getFullName(this: IUserDocument): string {
  return `${this.firstName || ""} ${this.lastName || ""}`;
}
