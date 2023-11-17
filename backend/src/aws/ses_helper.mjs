import {SESClient} from '@aws-sdk/client-ses'
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { randomNumberBetween } from '../helper.mjs';
import dotenv from 'dotenv';

dotenv.config();

const sesCredentials ={
    accessKeyId: process.env.SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY
}
const sesRegion = process.env.SES_REGION
const sesClient = new SESClient({region: sesRegion, credentials: sesCredentials})

/**
 * code borrowed for aws ses' documentation
 * https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_ses_code_examples.html
 * 
 */
function createSendEmailCommand(toAddress, subject, body, cc=[]){
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: cc,
      ToAddresses: [
        toAddress,
        /* more To-email addresses */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Text: {
          Charset: "UTF-8",
          Data: body,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: process.env.SES_MAIL,
  });
};

export function sendEmail(to, subject, body, cc=[]){
    return sesClient.send(createSendEmailCommand(to, subject, body, cc))
}

export function sendValidationEmail(to){
    const randomCode = randomNumberBetween(10000, 99999)
    const subject = "Your Validation Code"
    const body = `Your validation code is ${randomCode}.`
    const emailPromise = sendEmail(to, subject, body)
    return [randomCode, emailPromise]
}