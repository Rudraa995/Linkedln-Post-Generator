import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
 return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
 return new Date(dateString).toLocaleDateString(undefined, {
 month: 'short',
 day: 'numeric',
 })
}

export function formatDateTime(dateString: string): string {
 return new Date(dateString).toLocaleString(undefined, {
 month: 'short',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 })
}

export function truncate(text: string, length: number): string {
 if (text.length <= length) return text
 return text.slice(0, length).trim() + '…'
}

export function generateId(): string {
 return crypto.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

/**
 * Safely extract a human-readable message from an unknown error.
 * Use in catch blocks instead of `error: any`.
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: unknown }).message
    if (typeof msg === 'string') return msg
  }
  return fallback
}

/**
 * Copy text to clipboard with a fallback for permission-denied contexts.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to legacy method
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'
    textarea.setAttribute('readonly', '')
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}
