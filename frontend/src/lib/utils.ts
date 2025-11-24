import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getBiasLabel(rating: number): string {
  const labels: Record<number, string> = {
    '-3': 'Far Left',
    '-2': 'Left',
    '-1': 'Center-Left',
    '0': 'Center',
    '1': 'Center-Right',
    '2': 'Right',
    '3': 'Far Right',
  }
  return labels[rating] || 'Unknown'
}

export function getBiasColor(rating: number): string {
  const colors: Record<number, string> = {
    '-3': 'bg-blue-600',
    '-2': 'bg-blue-400',
    '-1': 'bg-blue-200',
    '0': 'bg-gray-400',
    '1': 'bg-red-200',
    '2': 'bg-red-400',
    '3': 'bg-red-600',
  }
  return colors[rating] || 'bg-gray-400'
}

export function getAdminPeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    TRUMP_1: 'Trump 1 (2017-2021)',
    TRUMP_2: 'Trump 2 (2025-)',
    OTHER: 'Other',
  }
  return labels[period] || period
}

export function getAdminPeriodShortLabel(period: string): string {
  const labels: Record<string, string> = {
    TRUMP_1: 'Trump 1',
    TRUMP_2: 'Trump 2',
    OTHER: 'Other',
  }
  return labels[period] || period
}
