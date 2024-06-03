const request = require("request");
const ErrorResponse = require("./errorResponse");

/**
 * @typedef {Object} SMS-Media
 * @property {string} url - The url to the media ["https://media.example.com/file"].
 * @property {string} caption - The media caption ["your media file"].
 */

/**
 * const data = {
    to: "2347880234567",
    from: "talert",
    sms: "Hi there, testing Termii",
    type: "plain",
    api_key: "Your API key",
    channel: "generic",
    media: {
      url: "https://media.example.com/file",
      caption: "your media file",
    },
  };
 */

/**
 *
 * @param {SMS-Payloaod} payload
 * @returns
 */
const sendSMS = async (to = [], sms = "", smsMedia = {}) => {
  if (to.length < 1 || !sms) {
    console.log("No SMS data provided!");
    return;
  }

  to = to.length < 2 ? String(to[0]) : to; // likeyl unnecessary // TODO: delete

  // update payload with api specific properties
  const payload = {
    to,
    sms,
    from: process.env.SMS_FROM_NAME,
    type: "plain",
    api_key: process.env.SMS_API_KEY,
    channel: "generic",
  };
  console.log({ payload });

  const options = {
    method: "POST",
    url: `${process.env.SMS_BASE_URL}/api/sms/send`,
    headers: {
      "Content-Type": ["application/json", "application/json"],
    },
    body: JSON.stringify(payload),
  };

  // request(options, function (error, response,) {
  //   if (error) throw new Error(error);
  //   console.log({ "response body": response.body });
  //   return response;
  // })

  async function asyncRequest(options) {
    return new Promise((resolve, reject) => {
      request(options, function (error, response, body) {
        if (error) {
          console.log({"error message": error.message})
          reject(error);
          // throw new Error(error);
        } else {
          // console.log({response, body})
          resolve(response.body);
          // return response;
        }
      });
    });
  }

  const response = await asyncRequest(options).catch(err => {
    throw new ErrorResponse(`Error sendind sms: ${err.message}`, 500)
  });
  // console.log({response})
  return response;
};

module.exports = sendSMS;
