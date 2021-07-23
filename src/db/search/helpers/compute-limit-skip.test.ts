import { computeLimitAndSkip } from "./compute-limit-skip";

describe("compute limit and skip tests", () => {
  test("make sure compute limit function behaves properly - empty object", () => {
    // tslint:disable-next-line: whitespace
    const options = {};
    const result = computeLimitAndSkip(options);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(0);
  });

  test("undefined object", () => {
    const undefinedOptions: any = undefined;
    const newResult = computeLimitAndSkip(undefinedOptions);
    expect(newResult.limit).toBe(20);
    expect(newResult.skip).toBe(0);
  });

  test("some value is undefined", () => {
    const options = { limit: undefined as any, skip: 5 };
    const result = computeLimitAndSkip(options);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(5);
  });

  test("both values are undefined", () => {
    const options = { limit: undefined as any, skip: undefined as any };
    const result = computeLimitAndSkip(options);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(0);
  });

  test("makes sure defined values are not overwritten", () => {
    const options = { limit: 50, skip: 1 };
    const result = computeLimitAndSkip(options);
    expect(result.limit).toBe(50);
    expect(result.skip).toBe(1);
  });
});
