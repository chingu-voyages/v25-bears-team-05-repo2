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
      docs.filter((doc) => doc.forAccountEmail === reqParams.withEmail).length
    ).toBe(2);
    expect(docs.length).toBe(5);
    expect(
      docs.some((doc) => doc.forAccountEmail === "random0@example.com")
    ).toBe(true);
  });

  test("creates correct amount of documents, correct number of matching-email documents - weird input", () => {
    const reqParams = {
      totalNumberRequests: 1,
      withEmail: "myemail@example.com",
      matchingNumber: 12,
    };
    const docs = createDummyRecoveryRequestDocuments(reqParams);
    expect(
      docs.filter((doc) => doc.forAccountEmail === reqParams.withEmail).length
    ).toBe(1);
    expect(docs.length).toBe(1);
    expect(docs[0].forAccountEmail).toBe(reqParams.withEmail);
  });
});
