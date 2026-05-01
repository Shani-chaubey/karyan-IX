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

    const adminHtml = `
      <h2>New Property Inquiry - Karyan Nine</h2>
      <p>Hi Team</p>
      <p>A new lead has been submitted on the landing page. Here are the details:</p>
      <p><strong>Project Name:</strong> Karyan Nine</p>
      <p><strong>Form / Button:</strong> ${escapeHtml(formType)}</p>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Mobile:</strong> ${escapeHtml(mobile)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    `;
    await sendEmail(
      adminRecipientsForFormType(formType),
      adminHtml,
      "New Lead From - Karyan Nine",
    );

    const userHtml = `
      <p>Dear ${escapeHtml(name)},</p>
      <p>Thank you for reaching out to us regarding the "Karyan Nine" project. We truly appreciate your interest.</p>
      <p>Our team is excited to assist you and we'll be in touch with you soon to discuss your requirements and provide further details about the project.</p>
      <p>If you have any immediate questions or need additional information, please feel free to contact us.</p>
      <p><strong>Karyan Infratech Group</strong></p>
    `;
    await sendEmail(
      email,
      userHtml,
      "Thank You for Your Interest in - Karyan Nine",
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
