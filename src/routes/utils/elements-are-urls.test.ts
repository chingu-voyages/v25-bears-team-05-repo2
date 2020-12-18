import { areAllElementsUrls } from "./elements-are-urls";

describe("elements are urls tests", () => {
  test("returns correct result", () => {
    const sampleData1 = ["https://nbc.com", "http://some-url.net", "https://another-type.url.com"];
    const sampleData2 = ["https://nbc.com", "://some-url.com", "https://another-type.url.com"];

    expect(areAllElementsUrls(sampleData1)).toBe(true);
    expect(areAllElementsUrls(sampleData2)).toBe(false);
  });
});
