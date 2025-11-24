import { FastifyReply } from 'fastify'

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface SingleResponse<T> {
  success: true
  data: T
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

export function sendPaginated<T>(
  reply: FastifyReply,
  data: T[],
  page: number,
  pageSize: number,
  total: number
): void {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
  reply.send(response)
}

export function sendSuccess<T>(reply: FastifyReply, data: T, statusCode = 200): void {
  const response: SingleResponse<T> = {
    success: true,
    data,
  }
  reply.status(statusCode).send(response)
}

export function sendCreated<T>(reply: FastifyReply, data: T): void {
  sendSuccess(reply, data, 201)
}

export function sendNoContent(reply: FastifyReply): void {
  reply.status(204).send()
}

export interface PaginationParams {
  page: number
  pageSize: number
  skip: number
  take: number
}

export function parsePagination(
  pageParam?: string | number,
  pageSizeParam?: string | number
): PaginationParams {
  const page = Math.max(1, parseInt(String(pageParam || 1), 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(String(pageSizeParam || 20), 10)))

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}
