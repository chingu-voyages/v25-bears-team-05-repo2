require("dotenv").config();
import { ConnectionOptions, connect } from "mongoose";
import assert from "assert";
import { getEnvironmentVariable } from "../src/utils/get-env-variable/get-env";
const connectDB = async () => {
  try {
    const mongoURI = getEnvironmentVariable({
      production: process.env.PRODUCTION_MONGO_DB_URI,
      dev: process.env.DEV_MONGO_DB_URI,
      test: process.env.TEST_MONGO_DB_URI,
    });

    assert(
      mongoURI,
      "Mongo connection URI is not defined. Check environment variables",
    );
    const options: ConnectionOptions = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    };
    await connect(mongoURI, options);
    console.log(
      `MongoDB Connected... ${getEnvironmentVariable({ production: "production", dev: "development", test: "test" })}`,
    );
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
