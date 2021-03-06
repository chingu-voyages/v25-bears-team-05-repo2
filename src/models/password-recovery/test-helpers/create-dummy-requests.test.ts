import { decrypt } from "../../../utils/crypto";
import { createDummyRecoveryRequestDocuments } from "./create-dummy-requests";

describe("dummy request document test", () => {
  test("creates correct amount of documents, correct number of matching-email documents", () => {
    const reqParams = {
      totalNumberRequests: 5,
      withEmail: "myemail@example.com",
      matchingNumber: 2,
    };
    const docs = createDummyRecoveryRequestDocuments(reqParams);
    expect(
      docs.filter((doc) => decrypt(doc.forAccountEmail) === reqParams.withEmail)
        .length
    ).toBe(2);
    expect(docs.length).toBe(5);
    expect(
      docs.some((doc) => decrypt(doc.forAccountEmail) === "random0@example.com")
    ).toBe(true);
  });

  test("creates correct amount of documents, correct number of matching-email documents - total number of requests is less than the requested matching email number", () => {
    const reqParams = {
      totalNumberRequests: 1,
      withEmail: "myemail@example.com",
      matchingNumber: 12,
    };
    const docs = createDummyRecoveryRequestDocuments(reqParams);
    expect(
      docs.filter((doc) => decrypt(doc.forAccountEmail) === reqParams.withEmail)
        .length
    ).toBe(1);
    expect(docs.length).toBe(1);
    expect(decrypt(docs[0].forAccountEmail)).toBe(reqParams.withEmail);
  });

  test("creates correct amount of documents, correct number of matching-email documents - 1 requested matching email number ", () => {
    const reqParams = {
      totalNumberRequests: 12,
      withEmail: "myemail@example.com",
      matchingNumber: 1,
    };
    const docs = createDummyRecoveryRequestDocuments(reqParams);
    expect(
      docs.filter((doc) => decrypt(doc.forAccountEmail) === reqParams.withEmail)
        .length
    ).toBe(1);
    expect(docs.length).toBe(12);
  });

  test("creates all matching e-mail documents when total request and matching number are the same", () => {
    const reqParams = {
      totalNumberRequests: 5,
      withEmail: "myemail@example.com",
      matchingNumber: 5,
    };
    const docs = createDummyRecoveryRequestDocuments(reqParams);
    expect(
      docs.filter((doc) => decrypt(doc.forAccountEmail) === reqParams.withEmail)
        .length
    ).toBe(5);
  });
});
