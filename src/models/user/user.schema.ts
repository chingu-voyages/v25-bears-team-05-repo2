import { Schema, SchemaOptions } from "mongoose";
import { findOneOrCreateByGoogleId, findByGoogleId,
  registerUser, findByEncryptedEmail,
  findOneByEncryptedEmail }
  from "./user.auth/user.auth.methods";
import { addConnectionToUser,
  deleteConnectionFromUser,
  getConnectionOfFromConnections,
  getUserDocumentsFromSourceUserConnectionOf }
  from "./user.connections/user.connections.methods";
import { updateUserProfile } from "./user.profile/user.profile.methods";
import { addReactionToThread,
  addThreadComment,
  createAndPostThread,
  deleteReactionFromThread,
  deleteThread,
  deleteThreadComment,
  deleteThreadFork,
  getConnectionThreads,
  forkThread }
from "./user.thread/user.thread.methods";

interface SchemaOptionsWithPojoToMixed extends SchemaOptions {
  typePojoToMixed: boolean;
}

const UserSchema: Schema = new Schema({
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
      required: false
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: false
    },
    oauth: {
      type: String,
      required: false
    }
  },
  avatarUrls: {
    type: [{ url: String}],
  },
  connections: {
    type: Schema.Types.Mixed,
    required: true,
    default: { }
  },
  connectionOf: {
    type: Schema.Types.Mixed,
    required: true,
    default: { }
  },
  threads: {
    started: {
      type: Schema.Types.Mixed,
      required: true,
      default: { },
    },
    commented: {
      type: Schema.Types.Mixed,
      required: true,
      default: { },
    },
    reacted: {
      type: Schema.Types.Mixed,
      required: true,
      default: { },
    },
    forked: {
      type: Schema.Types.Mixed,
      required: true,
      default: { },
    }
  },
}, { timestamps: { }, strict: false, typePojoToMixed: false} as SchemaOptionsWithPojoToMixed);
UserSchema.index({ "firstName": "text", "lastName": "text", "jobTitle":  "text" });

UserSchema.statics.findOneOrCreateByGoogleId = findOneOrCreateByGoogleId;
UserSchema.statics.findByGoogleId = findByGoogleId;
UserSchema.statics.registerUser = registerUser;
UserSchema.statics.findByEncryptedEmail = findByEncryptedEmail;
UserSchema.statics.findOneByEncryptedEmail = findOneByEncryptedEmail;

UserSchema.methods.addConnectionToUser = addConnectionToUser;
UserSchema.methods.deleteConnectionFromUser = deleteConnectionFromUser;
UserSchema.methods.updateUserProfile = updateUserProfile;
UserSchema.methods.createAndPostThread = createAndPostThread;
UserSchema.methods.getConnectionThreads = getConnectionThreads;
UserSchema.methods.getConnectionOfFromConnections = getConnectionOfFromConnections;
UserSchema.methods.addReactionToThread = addReactionToThread;
UserSchema.methods.deleteReactionFromThread = deleteReactionFromThread;
UserSchema.methods.addThreadComment = addThreadComment;
UserSchema.methods.deleteThreadComment = deleteThreadComment;
UserSchema.methods.forkThread = forkThread;
UserSchema.methods.deleteThreadFork = deleteThreadFork;
UserSchema.methods.deleteThread = deleteThread;
UserSchema.methods.getUserDocumentsFromSourceUserConnectionOf = getUserDocumentsFromSourceUserConnectionOf;

export default UserSchema;
