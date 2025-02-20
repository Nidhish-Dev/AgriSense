import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NEXT_PUBLIC_EMAIL_USER,
    pass: process.env.NEXT_PUBLIC_EMAIL_PASS,
  },
});

let emailSent = false;

export async function POST(req: Request) {
  if (emailSent) {
    return NextResponse.json({ message: 'Email already sent. Please try again later.' });
  }

  emailSent = true;

  const { humidity, mq135_ppm } = await req.json();

  let alertMessage = '';
  let sendAlert = false;

  // Check Humidity
  if (humidity < 30) {
    alertMessage += `<p><strong>ALERT:</strong> Humidity has dropped below 30%. It is now at ${humidity}%. This could indicate that the plants are in need of more water or the environment is getting too dry for optimal growth.</p>`;
    sendAlert = true;
  } else if (humidity > 80) {
    alertMessage += `<p><strong>ALERT:</strong> Humidity has risen above 80%. It is now at ${humidity}%. High humidity levels could promote mold growth or indicate poor ventilation.</p>`;
    sendAlert = true;
  }

  // Check VOC (mq135_ppm)
  if (mq135_ppm < 0.1) {
    alertMessage += `<p><strong>ALERT:</strong> VOC levels have dropped below 0.1 ppm. This could indicate poor air quality, which can affect plant health.</p>`;
    sendAlert = true;
  } else if (mq135_ppm > 2) {
    alertMessage += `<p><strong>ALERT:</strong> VOC levels have risen above 2 ppm. It is now at ${mq135_ppm} ppm. High VOC levels could be harmful to plant growth and indicate a potential environmental issue.</p>`;
    sendAlert = true;
  }

  // If no alert needs to be sent, return early
  if (!sendAlert) {
    return NextResponse.json({ message: 'No alert necessary. Sensor values are within normal range.' });
  }

  const mailOptions = {
    from: 'saviourr.team@gmail.com',
    to: 'singhalvarad1526@gmail.com, nidhishgaming7@gmail.com, krishpardhan471@gmail.com',
    subject: 'AgriSense Alert: Sensor Value Out of Range',
    html: `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f9;
            }
            .email-container {
              background-color: #ffffff;
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .email-header {
              text-align: center;
              background-color: #e74c3c;
              color: white;
              padding: 10px;
              border-radius: 5px 5px 0 0;
            }
            .email-header h2 {
              margin: 0;
            }
            .email-body {
              font-size: 16px;
              color: #333;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 14px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h2>AgriSense Alert: Sensor Value Out of Range</h2>
            </div>
            <div class="email-body">
              <p><strong>Immediate attention required:</strong></p>
              ${alertMessage}
              <p>Please take appropriate actions to address these issues to ensure the optimal growth of your plants.</p>
            </div>
            <div class="footer">
              <p>Sent by AgriSense Monitoring System</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  } finally {
    setTimeout(() => {
      emailSent = false;
    }, 7200000); // Allow email to be sent again after 2 hours (7200000 ms)
  }
}
