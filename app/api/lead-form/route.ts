import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import axios from "axios";

const fromUser = process.env.SMTP_USER!;
const password = process.env.SMTP_PASS!;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.karyaninfratech.co.in",
  port: Number(process.env.SMTP_PORT) || 26,
  secure: false,
  auth: { user: fromUser, pass: password },
});

async function sendEmail(
  recipients: string | string[],
  html: string,
  subject: string,
) {
  const to = Array.isArray(recipients) ? recipients.join(", ") : recipients;
  await transporter.sendMail({ from: fromUser, to, subject, html });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendToLeadAPI(
  name: string,
  email: string,
  mobile: string,
  formType: string,
) {
  try {
    await axios.post(
      "https://helptrip.me/WebService/Lead.asmx/InsertLead",
      new URLSearchParams({
        Name: name,
        ProjectName: "Karyan Nine",
        City: "Gzb",
        Location: "NCR",
        Remark: `Lead from ${formType}`,
        Source: "landing page",
        Email: email,
        Mobile: mobile,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );
  } catch (err: unknown) {
    console.error(`Lead API error (${formType}):`, (err as Error).message);
  }
}

function adminRecipientsForFormType(formType: string): string[] {
  const t = formType.toLowerCase();
  if (t.includes("brochure") && t.includes("download")) {
    return ["sales@globalrealtygroup.in", "amit.soam@globalrealtygroup.in"];
  }
  return [
    "sales@globalrealtygroup.in",
    "amit.soam@globalrealtygroup.in",
    "crm@globalrealtygroup.in",
    "anujpandit119@gmail.com",
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const name = params.get("name")?.trim();
    const email = params.get("email")?.trim();
    const mobile =
      params.get("mobile")?.trim() || params.get("phone")?.trim() || "";
    const formType = (
      params.get("formType")?.trim() || "Book a Site Visit"
    ).slice(0, 120);

    if (!name || !email || !mobile) {
      return NextResponse.json(
        { success: false, message: "Please provide all required information" },
        { status: 400 },
      );
    }

    await sendToLeadAPI(name, email, mobile, formType);

    const receivedAt = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "short",
    });

    const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Lead — Karyan Nine</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d1b2a 0%,#1a3050 100%);padding:32px 40px 28px;text-align:center;">
              <p style="margin:0 0 6px;color:#c6a96a;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Karyan Infratech Group</p>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.3px;">New Enquiry Received</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.65);font-size:13px;">Karyan Nine &mdash; Delhi-Meerut Expressway, Ghaziabad</p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding:32px 40px 8px;">
              <p style="margin:0 0 6px;color:#555;font-size:14px;line-height:1.6;">Hi Team,</p>
              <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">A new lead has been submitted through the Karyan Nine landing page. Please find the enquiry details below and follow up at the earliest.</p>
            </td>
          </tr>

          <!-- Lead Details Table -->
          <tr>
            <td style="padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e8edf2;">
                <tr style="background:#f8f9fc;">
                  <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid #e8edf2;" width="38%">Field</td>
                  <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid #e8edf2;">Details</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:13px;color:#888;border-bottom:1px solid #f0f3f7;font-weight:600;">Project</td>
                  <td style="padding:12px 16px;font-size:13px;color:#1a1a2e;border-bottom:1px solid #f0f3f7;font-weight:600;">Karyan Nine</td>
                </tr>
                <tr style="background:#fafbfd;">
                  <td style="padding:12px 16px;font-size:13px;color:#888;border-bottom:1px solid #f0f3f7;font-weight:600;">Source</td>
                  <td style="padding:12px 16px;font-size:13px;color:#1a1a2e;border-bottom:1px solid #f0f3f7;">${escapeHtml(formType)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:13px;color:#888;border-bottom:1px solid #f0f3f7;font-weight:600;">Name</td>
                  <td style="padding:12px 16px;font-size:13px;color:#1a1a2e;border-bottom:1px solid #f0f3f7;font-weight:600;">${escapeHtml(name)}</td>
                </tr>
                <tr style="background:#fafbfd;">
                  <td style="padding:12px 16px;font-size:13px;color:#888;border-bottom:1px solid #f0f3f7;font-weight:600;">Mobile</td>
                  <td style="padding:12px 16px;font-size:13px;color:#1a1a2e;border-bottom:1px solid #f0f3f7;font-weight:700;font-size:14px;"><a href="tel:${escapeHtml(mobile)}" style="color:#0d6efd;text-decoration:none;">${escapeHtml(mobile)}</a></td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:13px;color:#888;border-bottom:1px solid #f0f3f7;font-weight:600;">Email</td>
                  <td style="padding:12px 16px;font-size:13px;border-bottom:1px solid #f0f3f7;"><a href="mailto:${escapeHtml(email)}" style="color:#0d6efd;text-decoration:none;">${escapeHtml(email)}</a></td>
                </tr>
                <tr style="background:#fafbfd;">
                  <td style="padding:12px 16px;font-size:13px;color:#888;font-weight:600;">Received At</td>
                  <td style="padding:12px 16px;font-size:13px;color:#555;">${receivedAt} IST</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:8px 40px 36px;text-align:center;">
              <a href="tel:${escapeHtml(mobile)}" style="display:inline-block;background:linear-gradient(135deg,#c6a96a,#a8863c);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:0.4px;">Call Lead Now</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fc;border-top:1px solid #e8edf2;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#aaa;font-size:11px;line-height:1.6;">This is an automated notification from the Karyan Nine landing page.<br />Please do not reply to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await sendEmail(
      adminRecipientsForFormType(formType),
      adminHtml,
      `New Lead: ${escapeHtml(name)} — Karyan Nine`,
    );

    const userHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank You — Karyan Nine</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0d1b2a 0%,#1a3050 100%);padding:36px 40px 30px;text-align:center;">
              <p style="margin:0 0 6px;color:#c6a96a;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Karyan Infratech Group</p>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Thank You, ${escapeHtml(name)}!</h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.65);font-size:13px;">We have received your enquiry for Karyan Nine.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 24px;">
              <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.7;">Dear ${escapeHtml(name)},</p>
              <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.8;">Thank you for reaching out to us regarding <strong>Karyan Nine</strong> — our premium studio tower located on the <strong>Delhi-Meerut Expressway</strong>, opposite Wave City, Ghaziabad.</p>
              <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.8;">We truly appreciate your interest, and our sales team will contact you shortly to understand your requirements and share detailed information about the project, including pricing, floor plans, and site visit arrangements.</p>
              <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.8;">If you have an immediate query, you are welcome to reach us directly using the contact details below.</p>

              <!-- Highlight box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5ee;border-left:4px solid #c6a96a;border-radius:0 6px 6px 0;margin-bottom:28px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 10px;color:#7a5c1e;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Project Highlights</p>
                    <p style="margin:0 0 6px;color:#444;font-size:13px;line-height:1.6;">&#10003;&nbsp; Iconic 12-Floor Luxury Studio Tower</p>
                    <p style="margin:0 0 6px;color:#444;font-size:13px;line-height:1.6;">&#10003;&nbsp; Only 25 Exclusive Units per Floor</p>
                    <p style="margin:0 0 6px;color:#444;font-size:13px;line-height:1.6;">&#10003;&nbsp; Prime Frontage — Bang on Delhi-Meerut Expressway</p>
                    <p style="margin:0;color:#444;font-size:13px;line-height:1.6;">&#10003;&nbsp; Starting at &#8377;65 Lacs onwards</p>
                  </td>
                </tr>
              </table>

              <!-- Contact info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8edf2;border-radius:8px;overflow:hidden;">
                <tr style="background:#f8f9fc;">
                  <td colspan="2" style="padding:12px 16px;font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid #e8edf2;">Contact Us</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:13px;color:#888;border-bottom:1px solid #f0f3f7;font-weight:600;" width="30%">Phone</td>
                  <td style="padding:12px 16px;border-bottom:1px solid #f0f3f7;"><a href="tel:+919953298484" style="color:#0d6efd;text-decoration:none;font-size:13px;font-weight:600;">+91 995-329-8484</a></td>
                </tr>
                <tr style="background:#fafbfd;">
                  <td style="padding:12px 16px;font-size:13px;color:#888;font-weight:600;">Email</td>
                  <td style="padding:12px 16px;"><a href="mailto:sales@karyaninfratech.co.in" style="color:#0d6efd;text-decoration:none;font-size:13px;">sales@karyaninfratech.co.in</a></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 36px;text-align:center;">
              <a href="https://karyan9.in" style="display:inline-block;background:linear-gradient(135deg,#c6a96a,#a8863c);color:#ffffff;text-decoration:none;padding:13px 36px;border-radius:6px;font-size:14px;font-weight:600;letter-spacing:0.4px;">Visit Project Website</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fc;border-top:1px solid #e8edf2;padding:22px 40px;text-align:center;">
              <p style="margin:0 0 6px;color:#888;font-size:12px;font-weight:600;">Karyan Infratech Group</p>
              <p style="margin:0;color:#aaa;font-size:11px;line-height:1.6;">Karyan Nine, Delhi-Meerut Expressway, Ghaziabad, Uttar Pradesh<br />This email was sent in response to your enquiry. Please do not reply to this message.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await sendEmail(
      email,
      userHtml,
      "Thank You for Your Interest in Karyan Nine — We'll Be in Touch Shortly",
    );

    return NextResponse.json({ success: true, redirect: "/thank-you" });
  } catch (error: unknown) {
    console.error("Error processing lead form:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred",
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
