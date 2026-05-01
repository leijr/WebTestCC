import logging
from config import (
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, is_smtp_configured,
)

logger = logging.getLogger("email_service")


async def _send_email(to: str, subject: str, body: str):
    if not is_smtp_configured():
        logger.info(f"[EMAIL] To: {to} | Subject: {subject}")
        logger.info(f"[EMAIL] Body:\n{body}")
        return

    import aiosmtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    msg = MIMEMultipart()
    msg["From"] = SMTP_FROM
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            use_tls=True,
        )
        logger.info(f"Email sent to {to}: {subject}")
    except Exception as e:
        logger.error(f"Email failed to {to}: {e}")


async def send_welcome_email(to: str, username: str, password: str):
    await _send_email(
        to,
        "设备管理系统 - 账号创建通知",
        f"您好 {username}：\n\n"
        f"您的设备管理系统账号已创建。\n\n"
        f"用户名：{username}\n"
        f"初始密码：{password}\n\n"
        f"请首次登录后立即修改密码。\n\n"
        f"设备管理系统",
    )


async def send_overdue_reminder(to: str, username: str, device_name: str, due_date: str):
    await _send_email(
        to,
        "设备管理系统 - 设备超时未归还提醒",
        f"您好 {username}：\n\n"
        f"您借用的设备「{device_name}」已于 {due_date} 到期，至今仍未归还。\n"
        f"请尽快归还设备。如有疑问请联系管理员。\n\n"
        f"设备管理系统",
    )


async def send_password_changed_email(to: str, username: str):
    from datetime import datetime
    await _send_email(
        to,
        "设备管理系统 - 密码修改通知",
        f"您好 {username}：\n\n"
        f"您的设备管理系统账号密码已于 {datetime.now().strftime('%Y-%m-%d %H:%M')} 修改。\n"
        f"如非本人操作，请立即联系管理员。\n\n"
        f"设备管理系统",
    )
