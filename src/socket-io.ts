import { io } from "./server";

io.on("connection", (socket) => {
  console.log("connection - do something with it")
  socket.on("connection-data", (data) => {
    console.log(data);
  });

  socket.on("home-page", (data) => {
    console.log( new Date().toString(), "data from home page", data);
    socket.emit("home-page-response", "data-for-homepage");
  })
})


