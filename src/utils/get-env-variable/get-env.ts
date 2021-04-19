import assert from "assert";
/**
 * Helper function that returns the desired .env variable based on whether or not
 * we're in production or dev
 * @param input
 * @param production - the production .env variable
 * @param dev - the dev .env variable
 */
export function getEnvironmentVariable (input: { production: string, dev: string}) {
  assert(input.production, "the production environment variable resolves to undefined" );
  assert(input.dev, "the dev environment variable resolves to undefined");
  
  const isProduction =
  process.env.NODE_ENV && process.env.NODE_ENV.match("production");
  return isProduction
    ? input.production
    : input.dev
}
