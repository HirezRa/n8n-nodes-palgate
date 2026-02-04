/**
 * Comprehensive logging utilities for PAL Gate Node
 * 
 * These functions provide detailed logging for all operations,
 * making it easy to debug issues and track API calls.
 */

// TypeScript declaration for console (available in Node.js/n8n runtime)
declare const console: {
	log: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
};

/**
 * Log a request operation with full details
 */
export function logRequest(operation: string, details: Record<string, unknown>): void {
	const timestamp = new Date().toISOString();
	const separator = '='.repeat(70);
	
	console.log('\n' + separator);
	console.log(`[PAL Gate Node] ${timestamp}`);
	console.log(`[PAL Gate Node] Operation: ${operation}`);
	console.log('[PAL Gate Node] Request Details:');
	Object.entries(details).forEach(([key, value]) => {
		// Don't log sensitive data like tokens/passwords
		if (key.toLowerCase().includes('token') || key.toLowerCase().includes('password')) {
			console.log(`  - ${key}: [REDACTED]`);
		} else {
			console.log(`  - ${key}: ${JSON.stringify(value, null, 2)}`);
		}
	});
	console.log(separator + '\n');
}

/**
 * Log a response with status and body
 */
export function logResponse(operation: string, status: number, body: unknown): void {
	const timestamp = new Date().toISOString();
	const separator = '='.repeat(70);
	
	console.log('\n' + separator);
	console.log(`[PAL Gate Node] ${timestamp}`);
	console.log(`[PAL Gate Node] Response for: ${operation}`);
	console.log(`[PAL Gate Node] Status: ${status}`);
	console.log(`[PAL Gate Node] Response Body:`);
	console.log(JSON.stringify(body, null, 2));
	console.log(separator + '\n');
}

/**
 * Log an error with full context
 */
export function logError(operation: string, error: Error | unknown, context: Record<string, unknown>): void {
	const timestamp = new Date().toISOString();
	const separator = '!'.repeat(70);
	
	const errorMessage = error instanceof Error ? error.message : String(error);
	const errorStack = error instanceof Error ? error.stack : undefined;
	
	console.error('\n' + separator);
	console.error(`[PAL Gate Node] ${timestamp}`);
	console.error(`[PAL Gate Node] ERROR in: ${operation}`);
	console.error(`[PAL Gate Node] Error Message: ${errorMessage}`);
	if (errorStack) {
		console.error(`[PAL Gate Node] Stack Trace:\n${errorStack}`);
	}
	console.error('[PAL Gate Node] Context:');
	Object.entries(context).forEach(([key, value]) => {
		// Don't log sensitive data
		if (key.toLowerCase().includes('token') || key.toLowerCase().includes('password')) {
			console.error(`  - ${key}: [REDACTED]`);
		} else {
			console.error(`  - ${key}: ${JSON.stringify(value, null, 2)}`);
		}
	});
	console.error(separator + '\n');
}

/**
 * Log a critical operation (like delete) with extra warnings
 */
export function logCriticalOperation(operation: string, details: Record<string, unknown>): void {
	const timestamp = new Date().toISOString();
	const separator = '🔴'.repeat(35);
	
	console.warn('\n' + separator);
	console.warn(`[PAL Gate Node] ${timestamp}`);
	console.warn(`[PAL Gate Node] ⚠️  CRITICAL OPERATION: ${operation}`);
	console.warn('[PAL Gate Node] This is a destructive operation - verify all parameters!');
	console.warn('[PAL Gate Node] Operation Details:');
	Object.entries(details).forEach(([key, value]) => {
		if (key.toLowerCase().includes('token') || key.toLowerCase().includes('password')) {
			console.warn(`  - ${key}: [REDACTED]`);
		} else {
			console.warn(`  - ${key}: ${JSON.stringify(value, null, 2)}`);
		}
	});
	console.warn(separator + '\n');
}

/**
 * Log validation failure
 */
export function logValidationError(operation: string, field: string, value: unknown, reason: string): void {
	const timestamp = new Date().toISOString();
	const separator = '❌'.repeat(35);
	
	console.error('\n' + separator);
	console.error(`[PAL Gate Node] ${timestamp}`);
	console.error(`[PAL Gate Node] VALIDATION ERROR in: ${operation}`);
	console.error(`[PAL Gate Node] Field: ${field}`);
	console.error(`[PAL Gate Node] Value: ${JSON.stringify(value)}`);
	console.error(`[PAL Gate Node] Reason: ${reason}`);
	console.error(separator + '\n');
}
