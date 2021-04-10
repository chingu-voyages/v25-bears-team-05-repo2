import { generateAuthToken } from "../../../utils/generate-auth-token";
import { IPasswordRecovery } from "../password-recovery.types";

/**
 * Creates requests documents
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
