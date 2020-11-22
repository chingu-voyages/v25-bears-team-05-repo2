import { Schema } from "mongoose";
import { findByGoogleId,
  findOneOrCreateByGoogleId,
  registerUser,
  findByEncryptedEmail,
  findOneByEncryptedEmail }
  from "./user.methods";

const UserSchema: Schema = new Schema({
  firstName: String,
  lastName: String,
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
  connections: {},
  connectionOf: {},
  threads: {
    started: {},
    commented: {},
    liked: {},
    shared: {}
  },
}, { timestamps: {}});

UserSchema.statics.findOneOrCreateByGoogleId = findOneOrCreateByGoogleId;
UserSchema.statics.findByGoogleId = findByGoogleId;
UserSchema.statics.registerUser = registerUser;
UserSchema.statics.findByEncryptedEmail = findByEncryptedEmail;
UserSchema.statics.findOneByEncryptedEmail = findOneByEncryptedEmail;
export default UserSchema;
