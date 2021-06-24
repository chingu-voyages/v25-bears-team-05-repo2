const supertest = require("supertest");

import { setupTests } from "../db/test-helpers/test-helper";
import httpServer from "../server";
const request = supertest(httpServer);
jest.mock("request");
let testIds: any = [];
beforeEach(async ()=> {
  testIds = await setupTests();
});
describe("Users endpoint tests", ()=> {
  test("get users", async (done)=> {
    const res = await request.get(`/users/${testIds[0]}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.firstName).toBe("testUser0FirstName");
    console.log(res.body);
    done();
  });
});
