import { generateAuthToken } from "../../../utils/generate-auth-token";
import { IPasswordRecovery } from "../password-recovery.types";

/**
 *
 * @param totalNumberRequests the total amount of dummy requests to create
 * @param withEmail the test e-mail for which to create a request (forAccountEmail)
 * @param matchingNumber total number of requests to create that have `withEmail` as the forAccountEmail property
 * @returns
 */
export function createDummyRecoveryRequestDocuments({
  totalNumberRequests,
  withEmail,
  matchingNumber,
}: {
  totalNumberRequests: number;
  withEmail: string;
  matchingNumber: number;
}) {
  if (totalNumberRequests < 1) {
    totalNumberRequests = 1;
  }
  if (matchingNumber > totalNumberRequests) {
    matchingNumber = totalNumberRequests;
  }

  const requests: IPasswordRecovery[] = [];
  for (let i = 0; i < matchingNumber; i++) {
    requests.push({
      authToken: generateAuthToken(),
      forAccountEmail: withEmail,
      updatedAt: new Date(),
      requestorIpAddress: `fakeIp${i}`,
    });
  }

  if (requests.length === totalNumberRequests) return requests;

  const remainder = totalNumberRequests - requests.length;
  for (let i = 0; i < remainder; i++) {
    requests.push({
      authToken: generateAuthToken(),
      forAccountEmail: `random${i}@example.com`,
      updatedAt: new Date(),
      requestorIpAddress: `fakeIp${i}`,
    });
  }

  return requests;
}
