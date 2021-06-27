import { isURLValid } from "./valid-url";

describe("valid url tests", ()=> {
  test("random urls should result in correct result", ()=> {
    expect(isURLValid("htp://wemo.ca")).toBe(false);
    expect(isURLValid("http://wemo.ca/njk.png")).toBe(true);
    expect(isURLValid("http:// wemo.ca")).toBe(false);
    expect(isURLValid("http://toe2.theline.ca")).toBe(true);
    expect(isURLValid("http://toe2&theline.ca")).toBe(false);
    expect(isURLValid("https://www.mylittez.org/ko.jpg")).toBe(true);
    expect(isURLValid("htts://www.orb.co.uk/kob.jpg")).toBe(false);
    expect(isURLValid("http://www.orb.co.uk.com/kob-jpg.bmp")).toBe(true);
  });
});
