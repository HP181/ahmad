const ErrorResponse = require("./errorResponse");
const sendEmail = require("./sendEmail");

exports.sendUserFeedbackEmail = async feedback => {
  const email = feedback?.email
  const subject = `Feedback Received`
  const salutation = `Hello ${feedback?.name},`
  const content = `<p>Thank you for your feedback.</p>`;
  try {
    const response = await sendEmail({ email, subject, salutation, content });
    console.log({response})
    return [response]
  } catch (err) {
    console.log(err);
    throw new ErrorResponse(`Error Sending Feedback Mail: ${err.message}`, 500)
  }
};

exports.sendAdminFeedbackEmail = async feedback => {
  const email = process.env.CONTACT_EMAIL
  const subject = `Customer Feedback - ${feedback?.subject}`
  const salutation = `Hello,`
  const content = `
  <p>Kindly take note of this customer feedback:</p>
  <ul>
      <li><strong>Name:</strong> ${feedback?.name}</li>
      <li><strong>Email:</strong> ${feedback?.email}</li>
      <li><strong>Subject:</strong> ${feedback?.subject}</li>
      <li><strong>Message:</strong> ${feedback?.message}</li>
  </ul>`;
  try {
    const response = await sendEmail({ email, subject, salutation, content });
    console.log({response})
    return [response]
  } catch (err) {
    console.log(err);
    throw new ErrorResponse(`Error Sending Feedback Mail: ${err.message}`, 500);
  }
};

exports.sendFeedbackMails = async (feedback) => {
  await Promise.all([
    await this.sendUserFeedbackEmail(feedback),
    await this.sendAdminFeedbackEmail(feedback),
  ])
  return []
}