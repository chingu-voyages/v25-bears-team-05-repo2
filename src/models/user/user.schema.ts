import { Schema, SchemaOptions } from "mongoose";
import {
  findOneOrCreateByGoogleId,
  registerUser,
  findByEncryptedEmail,
  findOneByEncryptedEmail,
  changePassword,
} from "./user.auth/user.auth.methods";
import {
  addConnectionToUser,
  deleteConnectionFromUser,
  getSecondTierConnections,
  getUserDocumentsFromConnections,
} from "./user.connections/user.connections.methods";
import {
  getNotifications,
  dismissNotification,
} from "./user.notifications/user.notifications.methods";
import { getFullName, updateUserProfile } from "./user.profile/user.profile.methods";
import {
  addLikeToThread,
  addThreadComment,
  createAndPostThread,
  deleteLikeFromThread,
  deleteThread,
  deleteThreadComment,
  deleteThreadShare,
  getConnectionThreads,
  shareThread,
} from "./user.thread/user.thread.methods";

interface SchemaOptionsWithPojoToMixed extends SchemaOptions {
  typePojoToMixed: boolean;
}

const UserSchema: Schema = new Schema(
  {
    firstName: String,
    lastName: String,
    jobTitle: {
      type: String,
      default: "",
      required: false,
    },
    auth: {
      googleId: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: false,
      },
      oauth: {
        type: String,
        required: false,
      },
    },
    avatar: {
      type: [{ url: String }],
    },
    connections: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    connectionRequests: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    notifications: {
      type: [String],
      required: true,
      default: [],
    },
    threads: {
      started: {
        type: Schema.Types.Mixed,
        required: true,
        default: {},
      },
      commented: {
        type: Schema.Types.Mixed,
        required: true,
        default: {},
      },
      liked: {
        type: Schema.Types.Mixed,
        required: true,
        default: {},
      },
      shared: {
        type: Schema.Types.Mixed,
        required: true,
        default: {},
      },
    },
  },
  {
    timestamps: true,
    strict: false,
    typePojoToMixed: false,
  } as SchemaOptionsWithPojoToMixed,
);
UserSchema.index({
  "firstName": "text",
  "lastName": "text",
  "jobTitle": "text",
});

UserSchema.statics.findOneOrCreateByGoogleId = findOneOrCreateByGoogleId;
UserSchema.statics.registerUser = registerUser;
UserSchema.statics.findByEncryptedEmail = findByEncryptedEmail;
UserSchema.statics.findOneByEncryptedEmail = findOneByEncryptedEmail;

UserSchema.methods.addConnectionToUser = addConnectionToUser;
UserSchema.methods.deleteConnectionFromUser = deleteConnectionFromUser;
UserSchema.methods.updateUserProfile = updateUserProfile;
UserSchema.methods.createAndPostThread = createAndPostThread;
UserSchema.methods.getConnectionThreads = getConnectionThreads;
UserSchema.methods.getSecondTierConnections =
  getSecondTierConnections;
UserSchema.methods.addLikeToThread = addLikeToThread;
UserSchema.methods.deleteLikeFromThread = deleteLikeFromThread;
UserSchema.methods.addThreadComment = addThreadComment;
UserSchema.methods.deleteThreadComment = deleteThreadComment;
UserSchema.methods.shareThread = shareThread;
UserSchema.methods.deleteThreadShare = deleteThreadShare;
UserSchema.methods.deleteThread = deleteThread;
UserSchema.methods.getUserDocumentsFromConnections =
  getUserDocumentsFromConnections;
UserSchema.methods.changePassword = changePassword;
UserSchema.methods.getNotifications = getNotifications;
UserSchema.methods.dismissNotification = dismissNotification;
UserSchema.methods.getFullName = getFullName;

export default UserSchema;
