import { IUserDocument, IProfileData } from "../user.types";

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
