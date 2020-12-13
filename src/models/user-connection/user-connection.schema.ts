import { Schema } from "mongoose";

const UserConnectionSchema: Schema = new Schema({
  firstName: String,
  lastName: String,
  jobTitle: String,
  avatar: [{url: String}],
  userId: String,
  isTeamMate: Boolean,
  dateTimeConnected: Date,
});

export default UserConnectionSchema;
