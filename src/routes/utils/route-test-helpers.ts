export const getErrorText = (errorObject: any): string => {
  if (errorObject.text) {
    const parsedErrorObject = JSON.parse(errorObject.text);
    return parsedErrorObject.error;
  }
  throw new Error(`check the error object ${errorObject}`);
};
