
interface ErrorObject {
  location: string;
  param: string;
  value: string;
  msg: string;
}
export interface ErrorObjectCollection {
  errors: Array<ErrorObject>
}
export const getErrorText = (errorResponseObject: any): string | ErrorObjectCollection=> {
  if (errorResponseObject.text) {
    const parsedErrorObject = JSON.parse(errorResponseObject.text);
    if (parsedErrorObject.error) {
      return parsedErrorObject.error as string;
    }
    return parsedErrorObject as ErrorObjectCollection;
  }
  throw new Error(`check the error object ${errorResponseObject}`);
};
