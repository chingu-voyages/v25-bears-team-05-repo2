import { Schema, SchemaType } from "mongoose";
import { findByGoogleId,
  findOneOrCreateByGoogleId,
  registerUser,
  findByEncryptedEmail,
  findOneByEncryptedEmail,
  addConnectionToUser }
  from "./user.methods";

const UserSchema: Schema = new Schema({
  firstName: String,
  lastName: String,
  jobTitle: {
    type: String,
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
    started: {},
    commented: {},
    liked: {},
    shared: {}
  },
}, { timestamps: {}, strict: false}, );

UserSchema.statics.findOneOrCreateByGoogleId = findOneOrCreateByGoogleId;
UserSchema.statics.findByGoogleId = findByGoogleId;
UserSchema.statics.registerUser = registerUser;
UserSchema.statics.findByEncryptedEmail = findByEncryptedEmail;
UserSchema.statics.findOneByEncryptedEmail = findOneByEncryptedEmail;
UserSchema.methods.addConnectionToUser = addConnectionToUser;
export default UserSchema;
