/**
 * Global error handler middleware for Fastify
 * Logs errors and returns user-friendly responses
 */
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { logError } from '../utils/logger';

export interface ErrorResponse {
    error: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path?: string;
    requestId?: string;
}

/**
 * Global error handler
 */
export function errorHandler(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
): void {
    // Log the error with context
    logError(error, {
        method: request.method,
        url: request.url,
        params: request.params,
        query: request.query,
        ip: request.ip,
    });

    // Determine status code
    const statusCode = error.statusCode || 500;

    // Build error response
    const errorResponse: ErrorResponse = {
        error: error.name || 'Internal Server Error',
        message: process.env.NODE_ENV === 'production'
            ? 'An error occurred processing your request'
            : error.message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.id,
    };

    // In development, include stack trace
    if (process.env.NODE_ENV !== 'production') {
        (errorResponse as any).stack = error.stack;
    }

    reply.status(statusCode).send(errorResponse);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(request: FastifyRequest, reply: FastifyReply): void {
    const errorResponse: ErrorResponse = {
        error: 'Not Found',
        message: `Route ${request.method} ${request.url} not found`,
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: request.url,
    };

    reply.status(404).send(errorResponse);
}
