export const getReqUser = (req: any): string => {
  if (process.env.NODE_ENV && process.env.NODE_ENV.match("test")) {
    return req.body.testRequestorId;
  }
  return req.user.id;
};
