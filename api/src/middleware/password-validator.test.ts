import * as passwordValidators from "./password-validator";

describe("password validator tests", () => {
  test("password length", () => {
    const sample1 = "1234567";
    const sample2 = "12345678";
    expect(passwordValidators.doesPasswordMeetLengthRequirements(sample1)).toBe(false);
    expect(passwordValidators.doesPasswordMeetLengthRequirements(sample2)).toBe(true);
  });

  test("mixed case", () => {
    const sample1 = "mixedcase";
    const sample2 = "mixedCase";
    expect(passwordValidators.doesPasswordHaveMixedCase(sample1)).toBe(false);
    expect(passwordValidators.doesPasswordHaveMixedCase(sample2)).toBe(true);
  });

  test("valid password overall", () => {
    const sample1 = "MixedCaseP10";
    const sample2 = "alllowercase1";
    const sample3 = "pWdfe";
    const sample4 = "s23Ckb4!q09Fld8#";
    expect(passwordValidators.isPasswordValid(sample1)).toBe(true);
    expect(passwordValidators.isPasswordValid(sample2)).toBe(false);
    expect(passwordValidators.isPasswordValid(sample3)).toBe(false);
    expect(passwordValidators.isPasswordValid(sample4)).toBe(true);
  });
});
