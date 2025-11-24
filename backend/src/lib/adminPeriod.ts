import { AdminPeriod } from '@prisma/client'

// Trump 1st Administration: Jan 20, 2017 - Jan 20, 2021
const TRUMP_1_START = new Date('2017-01-20')
const TRUMP_1_END = new Date('2021-01-20')

// Trump 2nd Administration: Jan 20, 2025 - ongoing
const TRUMP_2_START = new Date('2025-01-20')

/**
 * Calculates the administration period for a given event date.
 * - TRUMP_1: Jan 20, 2017 - Jan 20, 2021
 * - TRUMP_2: Jan 20, 2025 - present
 * - OTHER: Any other time period
 */
export function calculateAdminPeriod(eventDate: Date): AdminPeriod {
  const date = new Date(eventDate)

  // Normalize to start of day in UTC for consistent comparison
  date.setUTCHours(0, 0, 0, 0)

  if (date >= TRUMP_1_START && date < TRUMP_1_END) {
    return AdminPeriod.TRUMP_1
  }

  if (date >= TRUMP_2_START) {
    return AdminPeriod.TRUMP_2
  }

  return AdminPeriod.OTHER
}

/**
 * Gets a human-readable label for an admin period.
 */
export function getAdminPeriodLabel(period: AdminPeriod): string {
  switch (period) {
    case AdminPeriod.TRUMP_1:
      return 'Trump Administration 1 (2017-2021)'
    case AdminPeriod.TRUMP_2:
      return 'Trump Administration 2 (2025-)'
    case AdminPeriod.OTHER:
      return 'Other Period'
  }
}

/**
 * Gets a short label for an admin period (for charts).
 */
export function getAdminPeriodShortLabel(period: AdminPeriod): string {
  switch (period) {
    case AdminPeriod.TRUMP_1:
      return 'Trump 1'
    case AdminPeriod.TRUMP_2:
      return 'Trump 2'
    case AdminPeriod.OTHER:
      return 'Other'
  }
}

/**
 * Gets the date range for an admin period.
 */
export function getAdminPeriodDateRange(period: AdminPeriod): { start: Date; end: Date | null } {
  switch (period) {
    case AdminPeriod.TRUMP_1:
      return { start: TRUMP_1_START, end: TRUMP_1_END }
    case AdminPeriod.TRUMP_2:
      return { start: TRUMP_2_START, end: null }
    case AdminPeriod.OTHER:
      return { start: new Date(0), end: null }
  }
}

/**
 * Validates that a date is not in the future.
 */
export function validateEventDate(date: Date): boolean {
  const today = new Date()
  today.setUTCHours(23, 59, 59, 999)
  return date <= today
}
