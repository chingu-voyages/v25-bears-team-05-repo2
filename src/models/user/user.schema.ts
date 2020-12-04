import { Schema, SchemaOptions } from "mongoose";
import { findOneOrCreateByGoogleId, findByGoogleId, registerUser, findByEncryptedEmail, findOneByEncryptedEmail } from "./user.auth.methods";
import { addConnectionToUser, deleteConnectionFromUser } from "./user.connections.methods";
import { updateUserProfile } from "./user.profile.methods";
import { createAndPostThread, getConnectionThreads } from "./user.thread.methods";

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
  avatar: {
    type: [{url: String}],
  },
  connections: {
    type: Schema.Types.Mixed,
    required: true,
    default: {}
  },
  connectionOf: {
    type: Schema.Types.Mixed,
    required: true,
    default: {}
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
    }
  },
}, { timestamps: {}, strict: false, typePojoToMixed: false} as SchemaOptionsWithPojoToMixed);

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


export default UserSchema;