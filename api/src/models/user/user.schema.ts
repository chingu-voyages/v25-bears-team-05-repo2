import { Schema } from "mongoose";

const UserSchema: Schema = new Schema({
  firstName: String,
  lastName: String,
  auth: {
    googleId: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false
    },
    password: {
      type: String,
      required: false,
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
  }
});

export default UserSchema;
