import nodemailer from 'nodemailer';
import path from 'path';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({ 
  to, 
  subject, 
  text, 
  html, 
  attachments 
}: { 
  to: string; 
  subject: string; 
  text?: string; 
  html?: string; 
  attachments?: Array<{
    filename: string;
    path?: string;
    cid?: string;
  }>;
}) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
    attachments,
  });
} 