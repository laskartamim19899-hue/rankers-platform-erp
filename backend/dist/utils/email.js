"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Configuration (To be filled by user in .env)
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});
const sendResetEmail = async (email, token) => {
    const subject = 'Password Reset Token - Rankers\' Platform';
    const text = `You requested a password reset. Your token is: ${token}\n\nThis token is valid for 1 hour.`;
    const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
      <h2 style="color: #0f172a;">Password Reset</h2>
      <p>You requested a password reset for your account at <strong>Rankers' Platform</strong>.</p>
      <div style="background: #f1f5f9; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; margin-bottom: 5px;">Your Recovery Token</p>
        <h1 style="font-size: 32px; letter-spacing: 10px; color: #0f172a; margin: 0;">${token}</h1>
      </div>
      <p style="font-size: 14px; color: #64748b;">This token will expire in 1 hour. If you didn't request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8;">Rankers' Platform - Institutional Intelligence Suite</p>
    </div>
  `;
    // If no SMTP config, fallback to logging to file for development
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        const logDir = path_1.default.join(process.cwd(), 'logs');
        if (!fs_1.default.existsSync(logDir))
            fs_1.default.mkdirSync(logDir);
        const logFile = path_1.default.join(logDir, 'emails.log');
        const logEntry = `[${new Date().toISOString()}] To: ${email} | Subject: ${subject} | Token: ${token}\n`;
        fs_1.default.appendFileSync(logFile, logEntry);
        console.log(`[DEV MODE] Email token logged to: ${logFile}`);
        return;
    }
    await transporter.sendMail({
        from: `"Rankers' Platform" <${SMTP_USER}>`,
        to: email,
        subject,
        text,
        html,
    });
};
exports.sendResetEmail = sendResetEmail;
//# sourceMappingURL=email.js.map