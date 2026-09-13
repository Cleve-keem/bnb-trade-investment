import { BrevoClient } from "@getbrevo/brevo";

export const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export async function sendFirstLoginOtpEmail({
  firstname,
  email,
  otp,
}: {
  email: string;
  otp: string;
  firstname: string;
}) {
  const response = await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: process.env.BREVO_SENDER_NAME!,
      email: process.env.BREVO_SENDER_EMAIL!,
    },

    to: [
      {
        email,
      },
    ],
    subject: "BNB Investment Trade - Login Verification Code",
    htmlContent: `
     <!DOCTYPE html>
      <html>
        <body>
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 500px;
              margin: 0 auto;
              padding: 24px;
              color: #111111;
            "
          >

            <div
              style="
                background: #000000;
                padding: 14px 18px;
                border-radius: 6px;
                display: inline-block;
                margin-bottom: 20px;
              "
            >
              <span
                style="
                  color: #e9ce39;
                  font-size: 20px;
                  font-weight: 700;
                "
              >
                BNB
              </span>

              <span
                style="
                  color: #ffffff;
                  font-size: 20px;
                  font-weight: 600;
                "
              >
                Investment Trade
              </span>
            </div>

            <h2
              style="
                font-size: 20px;
                margin-bottom: 8px;
              "
            >
              Login Verification
            </h2>

            <p
              style="
                font-size: 14px;
                color: #444444;
                line-height: 1.6;
              "
            >
              Hello ${firstname},
            </p>

            <p
              style="
                font-size: 14px;
                color: #444444;
                line-height: 1.6;
              "
            >
              We detected your first login to your BNB Investment Trade
              account. Use the verification code below to complete your
              secure login.
            </p>

            <div
              style="
                background: #fafafa;
                border: 1px solid #eeeeee;
                border-left: 4px solid #dabc17;
                padding: 20px;
                margin: 24px 0;
                text-align: center;
                border-radius: 6px;
              "
            >
              <p
                style="
                  margin: 0 0 8px 0;
                  font-size: 12px;
                  color: #777777;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                "
              >
                Verification Code
              </p>

              <div
                style="
                  font-size: 32px;
                  font-weight: 700;
                  letter-spacing: 8px;
                  color: #111111;
                "
              >
                ${otp}
              </div>

              <p
                style="
                  margin: 12px 0 0 0;
                  font-size: 12px;
                  color: #777777;
                "
              >
                This code expires in 10 minutes.
              </p>
            </div>

            <p
              style="
                font-size: 13px;
                color: #555555;
                line-height: 1.5;
              "
            >
              If you did not attempt to log in, you can safely ignore this
              email and secure your account if necessary.
            </p>

            <hr
              style="
                border: none;
                border-top: 1px solid #eeeeee;
                margin: 30px 0 20px;
              "
            />

            <p
              style="
                font-size: 11px;
                color: #999999;
                line-height: 1.5;
              "
            >
              Secure · Reliable · Trusted
            </p>

          </div>
        </body>
        </html>
        `,
  });

  return response;
};