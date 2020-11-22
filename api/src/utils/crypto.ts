require("dotenv").config();
import cryptoJS from "crypto-js";
import assert from "assert";

// Convenience util to help with encrypt / decrypt

export function encrypt (sourceString: string, passphrase?: string): string {
  assert(process.env.PASSPHRASE, "check your environment variables: PASSPHRASE variable is missing / undefined");
  try {
    return cryptoJS.AES.encrypt(sourceString, passphrase || process.env.PASSPHRASE).toString();
  } catch (err) {
    console.log(err);
  }
}

export function decrypt (cipherText: string, passphrase?: string): string {
  assert(process.env.PASSPHRASE, "check your environment variables: PASSPHRASE variable is missing / undefined");
  try {
    const bytes = cryptoJS.AES.decrypt(cipherText, passphrase || process.env.PASSPHRASE);
    return bytes.toString(cryptoJS.enc.Utf8);
  } catch (err) {
    console.log(err);
  }
}
