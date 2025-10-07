/**
 * Contact Form Handler for Netlify Forms
 * Handles form submission via AJAX to provide better UX
 * with success/error messages without page reload
 */

// Declare grecaptcha global type
declare global {
  interface Window {
    grecaptcha?: {
      reset: () => void
    }
  }
}

function encode(data: Record<string, string>) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&')
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact-form') as HTMLFormElement
  if (!form) return

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement
    const originalButtonText = submitButton?.textContent || 'Enviar'

    // Use void to explicitly ignore the promise return value
    void (async () => {
      try {
        // Disable submit button during submission
        if (submitButton) {
          submitButton.disabled = true
          submitButton.textContent = '...'
        }

        // Get form data
        const formData = new FormData(form)
        const data: Record<string, string> = {}

        formData.forEach((value, key) => {
          // Ensure value is a string - FormData values can be File or string
          data[key] = typeof value === 'string' ? value : value.name
        })

        // Submit to Netlify (using static form file for SSR compatibility)
        const response = await fetch('/forms.html', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encode(data),
        })

        if (response.ok) {
          // Success - show message and reset form
          showMessage('success', getSuccessMessage())
          form.reset()

          // Reset reCAPTCHA if present
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (window.grecaptcha?.reset) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            window.grecaptcha.reset()
          }
        } else {
          // Error response from server
          showMessage('error', getErrorMessage())
        }
      } catch (error) {
        // Network or other error
        console.error('Form submission error:', error)
        showMessage('error', getErrorMessage())
      } finally {
        // Re-enable submit button
        if (submitButton) {
          submitButton.disabled = false
          submitButton.textContent = originalButtonText
        }
      }
    })()
  })
})

function showMessage(type: 'success' | 'error', message: string) {
  // Remove any existing messages
  const existingMessage = document.querySelector('.form-message')
  if (existingMessage) {
    existingMessage.remove()
  }

  // Create message element
  const messageEl = document.createElement('div')
  messageEl.className = `form-message form-message--${type}`
  messageEl.textContent = message
  messageEl.setAttribute('role', 'alert')
  messageEl.setAttribute('aria-live', 'polite')

  // Insert after submit button (append to form)
  const form = document.querySelector('.contact-form')
  if (form) {
    form.appendChild(messageEl)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      messageEl.style.opacity = '0'
      setTimeout(() => messageEl.remove(), 300)
    }, 5000)
  }
}

function getSuccessMessage(): string {
  // Detect language from HTML lang attribute or default to Catalan
  const lang = document.documentElement.lang || 'ca'

  const messages: Record<string, string> = {
    ca: 'Missatge enviat correctament. Ens posarem en contacte aviat.',
    es: 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.',
    en: 'Message sent successfully. We will get in touch soon.',
  }

  return messages[lang] || messages['ca']
}

function getErrorMessage(): string {
  const lang = document.documentElement.lang || 'ca'

  const messages: Record<string, string> = {
    ca: "Error enviant el missatge. Si us plau, torna-ho a intentar o contacta'ns directament.",
    es: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo o contáctanos directamente.',
    en: 'Error sending message. Please try again or contact us directly.',
  }

  return messages[lang] || messages['ca']
}
