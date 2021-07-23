require("dotenv").config();

import connectDB from "../config/database";
import httpServer from "./server";
const port = process.env.PORT || 7000;
// Connect to MongoDB
connectDB();
httpServer.listen(port, ()=> {
  console.log(`http server listening on port ${port}`);
});

