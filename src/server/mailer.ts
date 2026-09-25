import nodemailer, { type Transporter, type SendMailOptions } from 'nodemailer';

export interface EmailLog {
  id: string;
  recipient: string;
  registrationCode: string;
  registrationName: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'simulated' | 'failed';
  previewUrl?: string;
  error?: string;
}

export interface RegistrationEmailData {
  id: string;
  code: string;
  name: string;
  email: string;
  phone?: string;
  ticketType: string;
  city?: string;
  state?: string;
  organization?: string;
  age?: number | string;
  guestsCount?: number;
  guestsNames?: string;
  accompanyingCount?: number;
  accompanyingNames?: string;
  createdAt: string;
}

// In-memory list of sent emails
const emailDeliveryLogs: EmailLog[] = [];

export function getEmailDeliveryLogs(): EmailLog[] {
  return emailDeliveryLogs;
}

let cachedTransporter: Transporter | null = null;
let isEthereal = false;

async function getTransporter(): Promise<Transporter> {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

  // Real SMTP configured
  if (host && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    console.log(`[E-mail] Transporter SMTP configurado com sucesso (${host}:${port})`);
    return cachedTransporter;
  }

  // Gmail service shortcut
  if (user && pass && user.includes('@gmail.com')) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    console.log(`[E-mail] Transporter Gmail configurado com sucesso (${user})`);
    return cachedTransporter;
  }

  // Automatic Ethereal fallback for instant testing and simulated delivery with preview link
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    isEthereal = true;
    console.log(`[E-mail] Transporter Ethereal (Ambiente de Testes/Desenvolvimento) ativado: ${testAccount.user}`);
    return cachedTransporter;
  } catch (err) {
    console.warn('[E-mail] Não foi possível criar conta Ethereal, usando JSON transport:', err);
    cachedTransporter = nodemailer.createTransport({ jsonTransport: true });
    return cachedTransporter;
  }
}

export function buildVoucherEmailHtml(reg: RegistrationEmailData): string {
  const guests = reg.accompanyingCount ?? reg.guestsCount ?? 0;
  const guestNames = reg.accompanyingNames || reg.guestsNames;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inscrição Confirmada - Evento dos Jovens IEPC 2026</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 30px 15px;
    }
    .card {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 36px 30px;
      text-align: center;
      color: #ffffff;
    }
    .header-badge {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.35);
      padding: 4px 14px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .header h1 {
      margin: 0 0 6px 0;
      font-size: 24px;
      font-weight: 800;
      line-height: 1.2;
    }
    .header p {
      margin: 0;
      font-size: 13px;
      color: #e0e7ff;
    }
    .content {
      padding: 30px;
    }
    .status-alert {
      background-color: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 16px;
      padding: 14px 18px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
    }
    .status-title {
      font-size: 14px;
      font-weight: 700;
      color: #065f46;
      margin: 0 0 2px 0;
    }
    .status-desc {
      font-size: 12px;
      color: #047857;
      margin: 0;
    }
    .voucher-box {
      background-color: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 20px;
      padding: 24px;
      text-align: center;
      margin-bottom: 26px;
    }
    .voucher-tag {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .voucher-code {
      display: inline-block;
      font-family: 'Courier New', Courier, monospace;
      font-size: 26px;
      font-weight: 900;
      color: #4f46e5;
      background-color: #eef2ff;
      border: 1px solid #c7d2fe;
      padding: 6px 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      letter-spacing: 2px;
    }
    .qr-container {
      background-color: #ffffff;
      padding: 12px;
      border-radius: 16px;
      display: inline-block;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      margin-bottom: 12px;
    }
    .qr-container img {
      width: 180px;
      height: 180px;
      display: block;
    }
    .qr-note {
      font-size: 11px;
      color: #64748b;
      margin: 0;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .details-table td {
      padding: 10px 14px;
      border-bottom: 1px solid #f1f5f9;
    }
    .details-label {
      color: #64748b;
      font-weight: 600;
      width: 38%;
    }
    .details-value {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }
    .instruction-card {
      background-color: #eef2ff;
      border: 1px solid #c7d2fe;
      border-radius: 16px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }
    .instruction-card h4 {
      margin: 0 0 8px 0;
      color: #3730a3;
      font-size: 14px;
      font-weight: 700;
    }
    .instruction-card p {
      margin: 0 0 6px 0;
      font-size: 12px;
      line-height: 1.5;
      color: #4338ca;
    }
    .instruction-card p:last-child {
      margin-bottom: 0;
    }
    .footer {
      background-color: #0f172a;
      padding: 24px 30px;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
      line-height: 1.5;
    }
    .footer strong {
      color: #ffffff;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <!-- Top Banner -->
      <div class="header">
        <div class="header-badge">✓ Inscrição Oficial Confirmada</div>
        <h1>Evento dos Jovens IEPC 2026</h1>
        <p>Juventude com Propósito • Avivamento, Adoração, Fé e Comunhão</p>
      </div>

      <!-- Main Body -->
      <div class="content">
        <!-- Status Box -->
        <div class="status-alert">
          <div>
            <div class="status-title">Status: Autorizado e Confirmado!</div>
            <div class="status-desc">A paz do Senhor, <strong>${reg.name}</strong>! Sua vaga está 100% garantida no evento.</div>
          </div>
        </div>

        <!-- Voucher & QR Code Box -->
        <div class="voucher-box">
          <div class="voucher-tag">Código de Credenciamento</div>
          <div class="voucher-code">${reg.code}</div>
          
          <br>
          <div class="qr-container">
            <img src="cid:qrcode_cid" alt="QR Code de Acesso Oficial IEPC" />
          </div>
          <p class="qr-note">Apresente este QR Code na portaria da igreja para retirada do mini crachá.</p>
        </div>

        <!-- Info Table -->
        <table class="details-table">
          <tr>
            <td class="details-label">Participante</td>
            <td class="details-value">${reg.name}</td>
          </tr>
          <tr>
            <td class="details-label">Categoria</td>
            <td class="details-value">${reg.ticketType || 'Membro IEPC'}</td>
          </tr>
          <tr>
            <td class="details-label">Data do Evento</td>
            <td class="details-value">21 de Novembro de 2026 (Sábado)</td>
          </tr>
          <tr>
            <td class="details-label">Horário de Início</td>
            <td class="details-value">A partir das 08h00 (Café da Manhã) • O dia todo</td>
          </tr>
          <tr>
            <td class="details-label">Local</td>
            <td class="details-value">Templo Sede da IEPC</td>
          </tr>
          <tr>
            <td class="details-label">Endereço</td>
            <td class="details-value">Auditório Central dos Jovens</td>
          </tr>
          ${reg.city ? `
          <tr>
            <td class="details-label">Cidade / UF</td>
            <td class="details-value">${reg.city}/${reg.state || 'SP'}</td>
          </tr>` : ''}
          ${reg.organization ? `
          <tr>
            <td class="details-label">Congregação / Igreja</td>
            <td class="details-value">${reg.organization}</td>
          </tr>` : ''}
          ${guests > 0 ? `
          <tr>
            <td class="details-label">Convidados adicionais</td>
            <td class="details-value">${guests} pessoa(s) ${guestNames ? `(${guestNames})` : ''}</td>
          </tr>` : ''}
          <tr>
            <td class="details-label">Valor da Inscrição</td>
            <td class="details-value" style="color: #059669;">100% Gratuito</td>
          </tr>
        </table>

        <!-- Instructions -->
        <div class="instruction-card">
          <h4>📌 Informações Importantes para o Dia:</h4>
          <p>• <strong>Credenciamento Rápido:</strong> Salve este e-mail no seu celular ou tire um print do QR Code acima para apresentar na entrada.</p>
          <p>• <strong>Mini Crachá:</strong> Ao chegar, você receberá na recepção o seu mini crachá físico exclusivo da juventude.</p>
          <p>• <strong>Traga sua Bíblia:</strong> Venha com o coração aberto para viver momentos de renovo, oração no altar e comunhão.</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>Igreja Evangélica Pentecostal Cristã (IEPC)</strong></p>
        <p>Departamento de Jovens & Adolescentes • Templo Sede</p>
        <p style="font-size: 11px; margin-top: 10px; color: #64748b;">
          Este é um e-mail automático do sistema oficial de inscrições da IEPC. Por favor, guarde este comprovante até o dia do evento.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendRegistrationEmail(
  reg: RegistrationEmailData,
  qrCodeDataUrl: string
): Promise<{ success: boolean; messageId?: string; previewUrl?: string; error?: string }> {
  try {
    if (!reg.email || !reg.email.includes('@')) {
      return { success: false, error: 'E-mail do participante inválido ou não informado.' };
    }

    const transporter = await getTransporter();

    // Extract base64 image data for inline CID attachment
    let qrAttachment: { filename: string; content: Buffer; cid: string } | null = null;
    if (qrCodeDataUrl && qrCodeDataUrl.includes('base64,')) {
      const base64Data = qrCodeDataUrl.split('base64,')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      qrAttachment = {
        filename: `qrcode-${reg.code}.png`,
        content: buffer,
        cid: 'qrcode_cid',
      };
    }

    const fromAddress = process.env.SMTP_FROM || '"Evento dos Jovens IEPC" <eventos@iepc.com.br>';
    const subject = `🎉 Inscrição Confirmada! Comprovante & QR Code - ${reg.code}`;
    const html = buildVoucherEmailHtml(reg);

    const mailOptions: SendMailOptions = {
      from: fromAddress,
      to: reg.email,
      subject,
      html,
      attachments: qrAttachment ? [qrAttachment] : [],
    };

    const info = await transporter.sendMail(mailOptions);
    let previewUrl: string | undefined = undefined;

    if (isEthereal && nodemailer.getTestMessageUrl) {
      const url = nodemailer.getTestMessageUrl(info);
      if (url) {
        previewUrl = url;
        console.log(`[E-mail Enviado] Link de visualização online: ${url}`);
      }
    }

    const logEntry: EmailLog = {
      id: `mail-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipient: reg.email,
      registrationCode: reg.code,
      registrationName: reg.name,
      subject,
      sentAt: new Date().toISOString(),
      status: isEthereal ? 'simulated' : 'sent',
      previewUrl,
    };

    emailDeliveryLogs.unshift(logEntry);
    if (emailDeliveryLogs.length > 50) emailDeliveryLogs.pop();

    console.log(`[E-mail] Comprovante e QR Code enviados com sucesso para ${reg.email} (Código: ${reg.code})`);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
    };
  } catch (err: any) {
    console.error(`[E-mail] Falha no envio para ${reg.email}:`, err);

    const logEntry: EmailLog = {
      id: `mail-err-${Date.now()}`,
      recipient: reg.email,
      registrationCode: reg.code,
      registrationName: reg.name,
      subject: `Inscrição - ${reg.code}`,
      sentAt: new Date().toISOString(),
      status: 'failed',
      error: err.message || 'Falha no transporte de e-mail',
    };
    emailDeliveryLogs.unshift(logEntry);

    return {
      success: false,
      error: err.message || 'Erro ao enviar e-mail de confirmação.',
    };
  }
}
