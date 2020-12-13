export type AppError = {
  location: string,
  message: string,
  param: string
};

export function createError(location: string, message: string, param: string): AppError {
    return { location, message, param };
}
