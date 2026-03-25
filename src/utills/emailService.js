const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// SMTP Configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send Email with Template Rendering
 * @param {Object} options - { to, subject, template, data }
 */
const sendEmail = async ({ to, subject, template, data }) => {
  try {
    // Render EJS template
    const templatePath = path.join(__dirname, `../templates/emails/${template}.ejs`);
    const html = await ejs.renderFile(templatePath, data);

    // Email options
    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME || 'Your App'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send OTP Email
 * @param {string} to - Recipient email
 * @param {string} otp - The OTP code
 */
const sendOtpEmail = async (to, otp) => {
  await sendEmail({
    to,
    subject: 'Your OTP Code',
    template: 'otpEmail',
    data: { otp, expiryMinutes: 15 }
  });
};

module.exports = {
  sendEmail,
  sendOtpEmail
};