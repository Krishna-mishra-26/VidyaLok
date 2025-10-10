import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const timeDifference = endDate.getTime() - startDate.getTime()
  return Math.ceil(timeDifference / (1000 * 3600 * 24))
}

export function calculateFine(dueDate: Date, returnDate: Date, finePerDay: number = 2): number {
  const overdueDays = calculateDaysBetween(dueDate, returnDate)
  return overdueDays > 0 ? overdueDays * finePerDay : 0
}

export function generateStudentId(): string {
  const year = new Date().getFullYear().toString().slice(-2)
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `STU${year}${randomNum}`
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateStudentId(studentId: string): boolean {
  const studentIdRegex = /^STU\d{6}$/
  return studentIdRegex.test(studentId)
}
