type WelcomeEmailProps = {
  name?: string | null
}

export function welcomeEmailTemplate({
  name,
}: WelcomeEmailProps) {
  const firstName =
    name?.trim()?.split(' ')[0] || 'there'

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <title>Welcome to Genim</title>
    </head>

    <body style="
      margin:0;
      padding:0;
      background:#f7f3ee;
      font-family: Inter, Arial, sans-serif;
      color:#1f1f1c;
    ">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
        <tr>
          <td align="center">

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              style="
                max-width:680px;
                background:#ffffff;
                border-radius:28px;
                overflow:hidden;
                box-shadow:0 10px 40px rgba(0,0,0,0.06);
              "
            >
              <!-- Header -->
              <tr>
                <td
                  style="
                    background:#f3ece4;
                    padding:42px 40px;
                    text-align:left;
                  "
                >
                  <img
                    src="https://www.askgenim.com/images/logo.png"
                    alt="Genim"
                    style="height:42px; width:auto;"
                  />

                  <div
                    style="
                      margin-top:28px;
                      display:inline-block;
                      background:#fff4ed;
                      color:#d6612d;
                      border-radius:999px;
                      padding:10px 16px;
                      font-size:13px;
                      font-weight:600;
                    "
                  >
                    Welcome to Genim
                  </div>

                  <h1
                    style="
                      margin:24px 0 0;
                      font-size:42px;
                      line-height:1;
                      letter-spacing:-0.04em;
                      color:#171714;
                    "
                  >
                    Let’s get you
                    <span style="color:#d6612d; font-style:italic;">
                      better, fast.
                    </span>
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding:42px 40px;">
                  <p style="
                    margin:0 0 22px;
                    font-size:16px;
                    line-height:30px;
                    color:#4f514d;
                  ">
                    Hi ${firstName},
                  </p>

                  <p style="
                    margin:0 0 22px;
                    font-size:16px;
                    line-height:30px;
                    color:#4f514d;
                  ">
                    Chika here — Co-Founder & CEO of Genim.
                  </p>

                  <p style="
                    margin:0 0 22px;
                    font-size:16px;
                    line-height:30px;
                    color:#4f514d;
                  ">
                    First off, welcome. You’re in.
                  </p>

                  <p style="
                    margin:0 0 22px;
                    font-size:16px;
                    line-height:30px;
                    color:#4f514d;
                  ">
                    Now let me say something most sales tools won’t tell you:
                  </p>

                  <div style="
                    margin:28px 0;
                    padding:24px;
                    border-radius:22px;
                    background:#faf8f5;
                    border:1px solid #ece4da;
                  ">
                    <p style="
                      margin:0;
                      font-size:18px;
                      line-height:34px;
                      font-weight:600;
                      color:#1f1f1c;
                    ">
                      Most reps don’t struggle because they’re lazy…
                      <br /><br />
                      They struggle because they don’t get enough real practice before it matters.
                    </p>
                  </div>

                  <p style="
                    margin:0 0 22px;
                    font-size:16px;
                    line-height:30px;
                    color:#4f514d;
                  ">
                    I know this because I’ve been there.
                  </p>

                  <p style="
                    margin:0 0 22px;
                    font-size:16px;
                    line-height:30px;
                    color:#4f514d;
                  ">
                    As an SDR/BDR selling for global software companies, I struggled — a lot.
                  </p>

                  <p style="
                    margin:0 0 22px;
                    font-size:16px;
                    line-height:30px;
                    color:#4f514d;
                  ">
                    Not because I didn’t care.
                  </p>

                  <p style="
                    margin:0 0 22px;
                    font-size:16px;
                    line-height:30px;
                    color:#4f514d;
                  ">
                    But because “training” was mostly:
                  </p>

                  <div style="
                    margin:24px 0;
                    padding:24px;
                    border-radius:22px;
                    background:#eef5f0;
                  ">
                    <div style="
                      font-size:15px;
                      line-height:30px;
                      color:#355244;
                    ">
                      • Shadow a few calls<br />
                      • Read some docs<br />
                      • Then… go figure it out on real prospects
                    </div>
                  </div>

                  <p style="
                    margin:0 0 22px;
                    font-size:16px;
                    line-height:30px;
                    color:#4f514d;
                  ">
                    That never made sense to me.
                  </p>

                  <p style="
                    margin:0 0 22px;
                    font-size:16px;
                    line-height:30px;
                    color:#4f514d;
                  ">
                    Pilots don’t learn mid-flight.
                    <br />
                    Doctors don’t practice during surgery.
                  </p>

                  <p style="
                    margin:0 0 22px;
                    font-size:16px;
                    line-height:30px;
                    color:#4f514d;
                  ">
                    But sales reps?
                  </p>

                  <p style="
                    margin:0 0 22px;
                    font-size:16px;
                    line-height:30px;
                    color:#4f514d;
                  ">
                    We throw them into live calls and hope for the best.
                  </p>

                  <p style="
                    margin:0 0 22px;
                    font-size:16px;
                    line-height:30px;
                    color:#4f514d;
                  ">
                    That’s why we built Genim.
                  </p>

                  <div style="
                    margin:28px 0;
                    padding:24px;
                    border-radius:22px;
                    background:#fff4ed;
                    border:1px solid #f0d7c8;
                  ">
                    <p style="
                      margin:0;
                      font-size:18px;
                      line-height:34px;
                      font-weight:600;
                      color:#a2542f;
                    ">
                      A place where you can actually practice,
                      fail safely, improve, and get better —
                      before it counts.
                    </p>
                  </div>

                  <h2 style="
                    margin:40px 0 16px;
                    font-size:24px;
                    line-height:1.2;
                    color:#171714;
                  ">
                    What to do next
                  </h2>

                  <div style="
                    padding:24px;
                    border-radius:22px;
                    background:#faf8f5;
                    border:1px solid #ece4da;
                  ">
                    <div style="
                      font-size:15px;
                      line-height:34px;
                      color:#4f514d;
                    ">
                      1. Run your first roleplay<br />
                      2. Review your feedback<br />
                      3. Retry and improve your score
                    </div>
                  </div>

                  <div style="margin-top:34px;">
                    <a
                      href="https://www.askgenim.com/scenarios"
                      style="
                        display:inline-block;
                        background:#d6612d;
                        color:#ffffff;
                        text-decoration:none;
                        padding:16px 28px;
                        border-radius:999px;
                        font-size:15px;
                        font-weight:700;
                      "
                    >
                      Start your first roleplay
                    </a>
                  </div>

                  <div style="
                    margin-top:42px;
                    padding:28px;
                    border-radius:24px;
                    background:#f7f3ee;
                  ">
                    <p style="
                      margin:0 0 18px;
                      font-size:16px;
                      line-height:30px;
                      color:#4f514d;
                    ">
                      And one more thing — I mean this:
                    </p>

                    <p style="
                      margin:0 0 14px;
                      font-size:15px;
                      line-height:30px;
                      color:#4f514d;
                    ">
                      If you have feedback, questions, or even think something sucks…
                    </p>

                    <p style="
                      margin:0;
                      font-size:15px;
                      line-height:32px;
                      color:#171714;
                      font-weight:600;
                    ">
                      👉 c@geniusnimble.com
                      <br />
                      👉 daniel@geniusnimble.com
                    </p>

                    <p style="
                      margin:18px 0 0;
                      font-size:15px;
                      line-height:30px;
                      color:#4f514d;
                    ">
                      We read everything.
                    </p>

                    <p style="
                      margin:18px 0 0;
                      font-size:15px;
                      line-height:30px;
                      color:#4f514d;
                    ">
                      We’re building Genim with you, not just for you.
                    </p>
                  </div>

                  <p style="
                    margin:40px 0 0;
                    font-size:16px;
                    line-height:30px;
                    color:#4f514d;
                  ">
                    Let’s get you sharper, more confident, and ready for real conversations.
                  </p>

                  <p style="
                    margin:26px 0 0;
                    font-size:16px;
                    line-height:30px;
                    color:#171714;
                    font-weight:600;
                  ">
                    Talk soon,
                    <br />
                    Chika
                    <br />
                    Co-Founder & CEO, Genim
                  </p>
                </td>
              </tr>

              <tr>
                <td
                  style="
                    padding:28px 40px;
                    border-top:1px solid #ece4da;
                    background:#faf8f5;
                  "
                >
                  <p style="
                    margin:0;
                    font-size:13px;
                    line-height:24px;
                    color:#8a8d87;
                    text-align:center;
                  ">
                    © 2026 Genim · AI-powered sales roleplay and coaching
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
  </html>
  `
}