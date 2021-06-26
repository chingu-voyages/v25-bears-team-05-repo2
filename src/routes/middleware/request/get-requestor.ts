export const getRequestor = (req: any): string => {
  if (process.env.NODE_ENV && process.env.NODE_ENV.match("test")) {
    return req.body.testRequestorId;
  } else {
    return req.user.id;
  }
};
