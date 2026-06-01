/**
 * HTML Sanitization for AI-translated content
 *
 * Prevents XSS attacks from GPT-generated HTML content
 */

import sanitizeHtml from 'sanitize-html'

/**
 * Sanitize HTML content from AI translation
 *
 * Allows safe HTML tags commonly used in medical content descriptions
 * while preventing XSS attacks
 *
 * @param html - Raw HTML string from GPT translation
 * @returns Sanitized HTML string
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return sanitizeHtml(html, {
    // Allowed tags - common formatting tags for medical content
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote',
      'a',
      'img',
      'div', 'span',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],

    // Allowed attributes per tag
    allowedAttributes: {
      'a': ['href', 'title', 'target', 'rel'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'div': ['class'],
      'span': ['class'],
      'p': ['class'],
      'h1': ['class'],
      'h2': ['class'],
      'h3': ['class'],
      'h4': ['class'],
      'h5': ['class'],
      'h6': ['class'],
      'table': ['class'],
      'th': ['class'],
      'td': ['class']
    },

    // Allowed schemes for URLs
    allowedSchemes: ['http', 'https', 'mailto'],

    // Allowed schemes for images
    allowedSchemesByTag: {
      img: ['http', 'https', 'data']
    },

    // Allow target="_blank" for external links
    allowedIframeHostnames: [],

    // Transform links to add security attributes
    transformTags: {
      'a': (tagName, attribs) => {
        // Add rel="noopener noreferrer" for security
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            rel: 'noopener noreferrer',
            // If target is blank, keep it; otherwise remove target attribute
            ...(attribs.target === '_blank' ? { target: '_blank' } : {})
          }
        }
      }
    },

    // Disallow certain tags completely (even if nested)
    disallowedTagsMode: 'discard',

    // Allow some CSS classes for styling
    allowedClasses: {
      'div': ['prose', 'max-w-none', 'text-gray-700'],
      'p': ['text-sm', 'text-gray-700', 'mb-2'],
      'h1': ['text-2xl', 'font-bold', 'mb-4'],
      'h2': ['text-xl', 'font-semibold', 'mb-3'],
      'h3': ['text-lg', 'font-medium', 'mb-2']
    }
  })
}

/**
 * Sanitize multiple HTML fields in an object
 *
 * @param data - Object containing HTML fields
 * @param htmlFields - Array of field names that contain HTML
 * @returns Object with sanitized HTML fields
 */
export function sanitizeHtmlFields<T extends Record<string, any>>(
  data: T,
  htmlFields: (keyof T)[]
): T {
  const sanitized = { ...data }

  for (const field of htmlFields) {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeHtmlContent(sanitized[field] as string) as any
    }
  }

  return sanitized
}

/**
 * Example usage for hospital data:
 *
 * ```typescript
 * const sanitizedHospital = sanitizeHtmlFields(hospitalData, [
 *   'overview',
 *   'full_description'
 * ])
 * ```
 */
