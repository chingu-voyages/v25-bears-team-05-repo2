import { encrypt } from "../crypto";
import { getEnvironmentVariable } from "../get-env-variable/get-env";
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: "api", key: process.env.MAILGUN_API_KEY });

const RECOVERY_LINKBACK_DOMAIN = getEnvironmentVariable({
  production: process.env.PRODUCTION_PASSWORD_RECOVERY_DOMAIN,
  dev: process.env.DEV_PASSWORD_RECOVERY_DOMAIN,
  test: undefined,
});

export async function sendRecoveryEmail(data: {
  destinationEmail: string;
  code: string;
}) {
  const hashedEmailAddress = encrypt(data.destinationEmail);
  const emailData = {
    from: process.env.MAILER_ADMIN_EMAIL,
    to: `${data.destinationEmail}`,
    subject: "Syncedup password recovery",
    text: `Please use http://${RECOVERY_LINKBACK_DOMAIN}/recover?id=${hashedEmailAddress}&data=${data.code} this link to recover your password`,
    html: `<html><body> <p>Please use <a href="http://${RECOVERY_LINKBACK_DOMAIN}/recover?id=${hashedEmailAddress}&data=${data.code}"> this link</a> to recover your password</p></body></html>`,
  };
  try {
    return await mg.messages.create(process.env.MAILER_DOMAIN, emailData);
  } catch (error) {
    console.log(error);
  }
}
