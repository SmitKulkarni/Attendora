/**
 * Multi-Channel Statutory Notification Pipeline (FR-ADM-04)
 * Formats and dispatches automated early-warning and debarment notices
 * across SMS (Twilio), WhatsApp Business API, and official statutory Email.
 */

export type NotificationChannel = 'SMS' | 'WHATSAPP' | 'EMAIL';

export interface DispatchRecipient {
  studentId: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  parentPhone?: string;
  courseCode: string;
  courseName: string;
  attendanceRate: number;
  classesNeeded: number;
  tier: 'WARNING' | 'CRITICAL';
}

export interface DispatchedNotice {
  id: string;
  recipientRollNo: string;
  recipientName: string;
  channel: NotificationChannel;
  destination: string;
  subject?: string;
  content: string;
  status: 'DELIVERED' | 'ENQUEUED' | 'FAILED';
  timestamp: string;
}

/**
 * Formats a statutory compliance alert message tailored to channel constraints.
 */
export function formatStatutoryNotice(
  recipient: DispatchRecipient,
  channel: NotificationChannel
): { subject?: string; content: string } {
  const isCritical = recipient.tier === 'CRITICAL';

  if (channel === 'SMS') {
    if (isCritical) {
      return {
        content: `[ATTENDORA CRITICAL] ${recipient.name} (${recipient.rollNo}): Attendance in ${recipient.courseCode} is ${recipient.attendanceRate}%, below statutory 75%. You face semester exam debarment. Attend next ${recipient.classesNeeded} classes & contact HOD.`,
      };
    }
    return {
      content: `[ATTENDORA ALERT] ${recipient.name}: Your attendance in ${recipient.courseCode} is ${recipient.attendanceRate}%. Attend the next ${recipient.classesNeeded} consecutive lectures to maintain safe 75% standing.`,
    };
  }

  if (channel === 'WHATSAPP') {
    if (isCritical) {
      return {
        content: `🚨 *OFFICIAL STATUTORY ATTENDANCE DEBARMENT WARNING*\n\n*Student:* ${recipient.name} (*${recipient.rollNo}*)\n*Subject:* ${recipient.courseName} (${recipient.courseCode})\n*Current Rate:* *${recipient.attendanceRate}%* (Statutory Threshold: 75.0%)\n*Recovery Target:* Must attend next *${recipient.classesNeeded} consecutive classes* without absence.\n\n⚠️ *Implication:* Under UGC/State University Regulations, students below 70% are prohibited from final examination registration without formal academic dean waiver.\n\n_Generated automatically by Attendora Academic Governance._`,
      };
    }
    return {
      content: `⚠️ *Academic Attendance Warning Notice*\n\nHello ${recipient.name},\nYour attendance in *${recipient.courseName}* is currently at *${recipient.attendanceRate}%*.\n\nTo restore your standing to the compliant tier (≥ 75%), you must attend the next *${recipient.classesNeeded} classes*.\n\nCheck your recovery trajectory in the Attendora Student App.`,
    };
  }

  // EMAIL
  const subject = isCritical
    ? `[URGENT] Statutory Attendance Debarment Notice — ${recipient.name} (${recipient.rollNo})`
    : `Academic Advisory: Attendance Warning in ${recipient.courseCode}`;

  const content = `
Official Academic Governance Communication
Institutional Reference: ATD-NOTIF-${Date.now().toString(36).toUpperCase()}

To: ${recipient.name} (Roll No: ${recipient.rollNo})
Email: ${recipient.email}
Course: ${recipient.courseName} (${recipient.courseCode})

This is a formal communication from the Academic Dean and Department of Computer Science & Engineering.

Current Attendance Status:
- Cumulative Rate: ${recipient.attendanceRate}%
- Statutory Regulatory Benchmark: 75.0%
- Current Standing: ${isCritical ? 'CRITICAL DEBARMENT PROBATION' : 'PRE-DEFICIT WARNING TIER'}
- Consecutive Lectures Required to Regain Safe Standing: ${recipient.classesNeeded}

${isCritical
  ? 'WARNING: Students failing to reach 75.0% by term completion will not be issued Examination Hall Tickets without explicit disciplinary board review.'
  : 'Please prioritize upcoming lectures to avoid reaching critical debarment standing.'}

Attendora Academic Compliance Engine
`.trim();

  return { subject, content };
}

/**
 * Simulates dispatching multi-channel statutory alerts.
 */
export function dispatchStatutoryNotices(
  recipients: DispatchRecipient[],
  channels: NotificationChannel[]
): DispatchedNotice[] {
  const logs: DispatchedNotice[] = [];
  const now = new Date().toISOString();

  recipients.forEach((rec, idx) => {
    channels.forEach((ch) => {
      const formatted = formatStatutoryNotice(rec, ch);
      const destination =
        ch === 'EMAIL' ? rec.email : ch === 'WHATSAPP' ? (rec.parentPhone || rec.phone) : rec.phone;

      logs.push({
        id: `notif-${Date.now()}-${idx}-${ch.toLowerCase()}`,
        recipientRollNo: rec.rollNo,
        recipientName: rec.name,
        channel: ch,
        destination,
        subject: formatted.subject,
        content: formatted.content,
        status: 'DELIVERED',
        timestamp: now,
      });
    });
  });

  return logs;
}

