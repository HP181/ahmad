const fs = require("fs");
const ErrorResponse = require("./errorResponse");
const sendEmail = require("./sendEmail");
const sendSMS = require("./sendSMS");

exports.sendUserAppointmentEmail = async (appointment) => {
  const email = appointment?.email;
  const subject = `Appointment Reserved`;
  const salutation = `Hello ${appointment?.firstname || appointment?.name},`;
  const appointmentType = appointment?.type
    ? `<li><strong>Service:</strong> ${appointment?.type}</li>`
    : "";
  const appointmentLocation = appointment?.location
    ? `<li><strong>Location:</strong> ${appointment?.location}</li>`
    : "";

  const content = `
  <p>You have successfully reserved your appointment.</p>
  <p>Kindly find the details of your appointment below:</p>
  <ul>  
      ${appointmentType}
      ${appointmentLocation}
      <li><strong>Date:</strong> ${new Date(
        appointment?.date
      )?.toLocaleString()}</li>
  </ul>`;
  try {
    // await fs.writeFileSync('./templates/content.html', content)
    const response = await sendEmail({ email, subject, salutation, content });
    // const response = content;
    // console.log({response, salutation, subject})
    return [response];
  } catch (err) {
    console.log(err);
    throw new ErrorResponse(
      `Error Sending Appointment Mail: ${err.message}`,
      500
    );
  }
};

exports.sendAdminAppointmentEmail = async (appointment) => {
  const email = process.env.FROM_EMAIL;
  const subject = `Appointment Reserved`;
  const salutation = `Hello,`;
  const fullname = appointment?.name
    ? `${appointment?.name}`
    : `${appointment?.firstname} ${appointment?.lastname}`;
  const appointmentFullname = `<li><strong>Name:</strong> ${fullname}</li>`;
  const appointmentPhone = appointment?.phone
    ? `<li><strong>Phone:</strong> ${appointment?.phone}</li>`
    : "";
  const appointmentType = appointment?.type
    ? `<li><strong>Service:</strong> ${appointment?.type}</li>`
    : "";
  const appointmentLocation = appointment?.location
    ? `<li><strong>Location:</strong> ${appointment?.location}</li>`
    : "";
  const appointmentMessage = appointment?.message
    ? `<li><strong>Described Symptoms:</strong> ${appointment?.message}</li>`
    : "";

  const content = `
  <p>Kindly be informed that a customer has booked an appointment.</p>
  <p>Find the details of the appointment below:</p>
  <ul>
      ${appointmentFullname}
      <li><strong>Email:</strong> ${appointment?.email}</li>
      ${appointmentPhone}
      ${appointmentType}
      ${appointmentLocation}
      <li><strong>Date:</strong> ${new Date(
        appointment?.date
      )?.toLocaleString()}</li>
      ${appointmentMessage}
  </ul>`;
  try {
    // await fs.writeFileSync('./templates/admincontent.html', content)
    const response = await sendEmail({ email, subject, salutation, content });
    // const response = content;
    // console.log({response, salutation, subject})
    return [response];
  } catch (err) {
    console.log(err);
    throw new ErrorResponse(
      `Error Sending Appointment Mail: ${err.message}`,
      500
    );
  }
};

exports.sendAppointmentMails = async (appointment) => {
  // // await this.sendUserAppointmentEmail(appointment);
  // // await this.sendAdminAppointmentEmail(appointment);
  await Promise.all([
    await this.sendUserAppointmentEmail(appointment),
    await this.sendAdminAppointmentEmail(appointment)
  ]);
  return [];
};

function convertPhoneNumber(phoneNumber) {
  // Check if the phone number starts with '0'
  if (phoneNumber.startsWith("0")) {
    // Remove the leading '0' and add '234' to the beginning
    return "234" + phoneNumber.slice(1);
  } else {
    // If the phone number doesn't start with '0', return as it is
    return phoneNumber;
  }
}

exports.sendAppointmentSMS = async (appointment) => {
  const firstname = `${
    appointment?.firstname || appointment?.name
  }`.toUpperCase();
  const datetime = new Date(appointment?.date);
  const date = datetime?.toLocaleDateString();
  const time = datetime?.toLocaleTimeString();

  const to = [convertPhoneNumber(appointment?.phone)];
  // const sms = `Hi ${firstname}. Your appointment at Ridge Dental Clinic is confirmed for ${date} at ${time}. Please arrive 10 minutes early. If you need to reschedule or cancel, kindly inform us at least 48 hours in advance. Thank you`;  // TODO: uncomment this
  const sms = `Hi ${firstname}, Your appointment at Ridge Dental Clinic is confirmed for ${date} at ${time}. Thank you`;
  try {
    const response = await sendSMS(to, sms); // TODO: uncomment this
    // const response = {to, sms}
    console.log("sms test response", response);
    return response;
  } catch (err) {
    console.log(`Error Sending Appointment SMS: ${err.message}`);
    // throw new ErrorResponse(
    //   `Error Sending Appointment SMS: ${err.message}`,
    //   500
    // );
  }
};
