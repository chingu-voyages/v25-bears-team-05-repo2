import { Schema } from "mongoose";

const UserConnectionSchema: Schema = new Schema({
  userId: String,
  isTeamMate: Boolean,
  dateTimeConnected: Date,
});

export default UserConnectionSchema;
