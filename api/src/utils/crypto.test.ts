import { encrypt, decrypt } from "./crypto";
require("dotenv").config();

describe("encryption function", () => {
  test("decrypts properly with provided passPhrase from process env", () => {
    const encryptedText = encrypt("hellotest123", process.env.PASSPHRASE);
    expect(decrypt(encryptedText,  process.env.PASSPHRASE)).toBe("hellotest123");
  });

  test("decrypts properly with no provided passphrase", () => {
    const encryptedText = encrypt("hellotest123");
    expect(decrypt(encryptedText)).toBe("hellotest123");
  });

  test("decrypts properly with customized passphrase", () => {
    const encryptedText = encrypt("hellotest123", "customPassphrase");
    expect(decrypt(encryptedText, "customPassphrase")).toBe("hellotest123");
  });

  test("incompatible passphrases for encrypt, decrypt should return empty string", () => {
    const encryptedText = encrypt("hellotest123", "customPassphrase");
    expect(decrypt(encryptedText)).toBe("");
  });
});
