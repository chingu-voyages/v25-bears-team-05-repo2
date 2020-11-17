import { Schema } from "mongoose";

const UserConnectionSchema: Schema = new Schema({
  firstName: String,
  lastName: String,
  avatar: [{url: String}],
  isTeamMate: Boolean
});

export default UserConnectionSchema;
