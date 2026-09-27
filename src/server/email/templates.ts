import { siteConfig } from "@/config/site"

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

function layout(opts: { preheader: string; title: string; body: string; cta?: { label: string; url: string } }) {
  const button = opts.cta
    ? `<tr><td style="padding:24px 0 8px"><a href="${opts.cta.url}" style="display:inline-block;background:#6d28d9;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px;font-size:14px">${esc(opts.cta.label)}</a></td></tr>
       <tr><td style="font-size:12px;color:#71717a;padding-top:12px">Se o botão não funcionar, copie e cole este link:<br><span style="color:#6d28d9;word-break:break-all">${opts.cta.url}</span></td></tr>`
    : ""
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
<span style="display:none;opacity:0">${esc(opts.preheader)}</span>
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border:1px solid #e4e4e7;border-radius:16px;padding:32px">
<tr><td style="font-weight:700;font-size:18px;color:#18181b;padding-bottom:24px"><span style="display:inline-block;width:22px;height:22px;border-radius:6px;background:#6d28d9;vertical-align:-5px;margin-right:8px"></span>${siteConfig.name}</td></tr>
<tr><td style="font-size:20px;font-weight:600;color:#18181b;padding-bottom:12px">${esc(opts.title)}</td></tr>
<tr><td style="font-size:14px;line-height:22px;color:#3f3f46">${opts.body}</td></tr>
${button}
</table>
<p style="font-size:12px;color:#a1a1aa;margin-top:16px">${siteConfig.name} · Você recebeu este email por causa da sua conta.</p>
</td></tr></table></body></html>`
}

export const templates = {
  verifyEmail: (name: string | null, url: string) => ({
    subject: `Confirme seu email no ${siteConfig.name}`,
    html: layout({
      preheader: "Confirme seu email para ativar sua conta.",
      title: `Bem-vindo${name ? `, ${esc(name.split(" ")[0])}` : ""}!`,
      body: "Confirme seu endereço de email para proteger sua conta e receber notificações importantes.",
      cta: { label: "Confirmar email", url },
    }),
    text: `Confirme seu email: ${url}`,
  }),
  resetPassword: (url: string) => ({
    subject: "Redefinição de senha",
    html: layout({
      preheader: "Link para redefinir sua senha (válido por 1 hora).",
      title: "Redefina sua senha",
      body: "Recebemos um pedido para redefinir sua senha. O link é válido por 1 hora. Se não foi você, ignore este email.",
      cta: { label: "Redefinir senha", url },
    }),
    text: `Redefina sua senha: ${url}`,
  }),
  changeEmail: (newEmail: string, url: string) => ({
    subject: "Confirme seu novo email",
    html: layout({
      preheader: "Confirme a troca de email da sua conta.",
      title: "Confirme seu novo email",
      body: `Para concluir a troca, confirme que <b>${esc(newEmail)}</b> é seu. O link é válido por 24 horas.`,
      cta: { label: "Confirmar novo email", url },
    }),
    text: `Confirme seu novo email: ${url}`,
  }),
  emailChangedNotice: (newEmail: string) => ({
    subject: "O email da sua conta foi alterado",
    html: layout({
      preheader: "Seu email de acesso foi alterado.",
      title: "Seu email foi alterado",
      body: `O email da sua conta agora é <b>${esc(newEmail)}</b>. Se você não fez isso, entre em contato com ${siteConfig.supportEmail} imediatamente.`,
    }),
    text: `O email da sua conta foi alterado para ${newEmail}.`,
  }),
  passwordChangedNotice: () => ({
    subject: "Sua senha foi alterada",
    html: layout({
      preheader: "Sua senha foi alterada.",
      title: "Senha alterada",
      body: `A senha da sua conta acabou de ser alterada. Se não foi você, redefina a senha e fale com ${siteConfig.supportEmail}.`,
    }),
    text: "Sua senha foi alterada.",
  }),
  invitation: (orgName: string, inviter: string, url: string) => ({
    subject: `${inviter} convidou você para ${orgName}`,
    html: layout({
      preheader: `Convite para ${orgName} no ${siteConfig.name}.`,
      title: `Junte-se a ${esc(orgName)}`,
      body: `<b>${esc(inviter)}</b> convidou você para colaborar em <b>${esc(orgName)}</b> no ${siteConfig.name}. O convite expira em 7 dias.`,
      cta: { label: "Aceitar convite", url },
    }),
    text: `Aceite o convite: ${url}`,
  }),
}
