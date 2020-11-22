require("dotenv").config();
import { ConnectionOptions, connect } from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI: string = process.env.DEV_MONGO_DB_URI;
    const options: ConnectionOptions = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    };
    await connect(mongoURI, options);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
