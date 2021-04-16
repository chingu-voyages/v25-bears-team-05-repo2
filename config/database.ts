require("dotenv").config();
import { ConnectionOptions, connect } from "mongoose";
import assert from "assert";
const connectDB = async () => {
  try {
    const isProduction =
      process.env.NODE_ENV && process.env.NODE_ENV.match("production");

    const mongoURI = isProduction
      ? process.env.PRODUCTION_MONGO_DB_URI
      : process.env.DEV_MONGO_DB_URI;

    assert(mongoURI, "Mongo connection URI is not defined. Check environment variables");
    const options: ConnectionOptions = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    };
    await connect(mongoURI, options);
    console.log(
      `MongoDB Connected... ${isProduction ? "production" : "development"}`
    );
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
