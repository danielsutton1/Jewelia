export function getEmailTemplate(type: string, params: Record<string, any>): { subject: string, html: string } {
  switch (type) {
    case 'meeting':
      return {
        subject: `Meeting Scheduled: ${params.topic}`,
        html: `
          <h2 style="color:#4F46E5;">${params.topic}</h2>
          <p>A meeting has been scheduled.</p>
          <p><strong>Start:</strong> ${params.start}</p>
          <p><strong>Duration:</strong> ${params.duration} minutes</p>
          <p><a href="${params.joinUrl}" style="color:#4F46E5;">Join Meeting</a></p>
        `
      }
    case 'calendar':
      return {
        subject: `Calendar Event: ${params.title}`,
        html: `
          <h2 style="color:#059669;">${params.title}</h2>
          <p>Event scheduled on your calendar.</p>
          <p><strong>Date:</strong> ${params.date}</p>
          <p><strong>Description:</strong> ${params.description}</p>
        `
      }
    case 'system':
      return {
        subject: `System Notification: ${params.title}`,
        html: `
          <h2 style="color:#F59E42;">${params.title}</h2>
          <p>${params.message}</p>
        `
      }
    case 'reminder':
      return {
        subject: `Reminder: ${params.title}`,
        html: `
          <h2 style="color:#F43F5E;">${params.title}</h2>
          <p>${params.message}</p>
          <p><strong>Due:</strong> ${params.dueDate}</p>
        `
      }
    default:
      return {
        subject: params.subject || 'Notification',
        html: `<p>${params.message || ''}</p>`
      }
  }
} 