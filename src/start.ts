import httpServer from "./server";
require("dotenv").config();
const port = process.env.PORT || 7000;
httpServer.listen(port, ()=> {
  console.log(`http server listening on port ${port}`);
});

