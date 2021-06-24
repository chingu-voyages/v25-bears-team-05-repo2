import assert from "assert";
/**
 * Helper function that returns the desired .env variable based on whether or not
 * we're in production or dev
 * @param input
 * @param production - the production .env variable
 * @param dev - the dev .env variable
 */
export function getEnvironmentVariable(input: {
  production: string;
  dev: string;
  test: string;
}) {
  const isProduction =
    process.env.NODE_ENV && process.env.NODE_ENV.match("production");
  if (isProduction) {
    assert(input.production, "a production environment variable is undefined");
    return input.production;
  }
  const isTest = process.env.NODE_ENV && process.env.NODE_ENV.match("test");
  console.log(process.env.NODE_ENV);
  if (isTest) {
    // assert(input.test, "test env variable not defined");
    return input.test;
  }

  return isProduction ? input.production : input.dev;
}
