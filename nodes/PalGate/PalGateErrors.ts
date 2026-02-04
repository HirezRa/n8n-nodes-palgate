import { NodeOperationError, NodeApiError } from 'n8n-workflow';
import type { INode, JsonObject } from 'n8n-workflow';

export interface PalGateErrorDetails {
	operation: string;
	resource: string;
	endpoint?: string;
	requestBody?: JsonObject;
	responseStatus?: number;
	responseBody?: JsonObject;
	timestamp: string;
}

export class PalGateValidationError extends NodeOperationError {
	constructor(
		node: INode,
		message: string,
		details: Partial<PalGateErrorDetails>,
		itemIndex?: number,
	) {
		const fullMessage = formatErrorMessage('Validation Error', message, details);
		super(node, fullMessage, { itemIndex });
	}
}

export class PalGateApiError extends NodeApiError {
	constructor(
		node: INode,
		error: JsonObject,
		details: Partial<PalGateErrorDetails>,
	) {
		const message = formatErrorMessage('API Error', String(error.message || 'Unknown error'), details);
		super(node, { ...error, message });
	}
}

function formatErrorMessage(
	type: string,
	message: string,
	details: Partial<PalGateErrorDetails>,
): string {
	const lines = [
		`[PAL Gate ${type}] ${message}`,
		'',
		'📋 Details:',
	];

	if (details.operation) {
		lines.push(`  • Operation: ${details.operation}`);
	}
	if (details.resource) {
		lines.push(`  • Resource: ${details.resource}`);
	}
	if (details.endpoint) {
		lines.push(`  • Endpoint: ${details.endpoint}`);
	}
	if (details.requestBody) {
		lines.push(`  • Request Body: ${JSON.stringify(details.requestBody, null, 2)}`);
	}
	if (details.responseStatus) {
		lines.push(`  • Response Status: ${details.responseStatus}`);
	}
	if (details.responseBody) {
		lines.push(`  • Response: ${JSON.stringify(details.responseBody, null, 2)}`);
	}

	lines.push('');
	lines.push(`⏰ Timestamp: ${details.timestamp || new Date().toISOString()}`);

	return lines.join('\n');
}

// Common validation errors
export function throwPhoneRequiredError(
	node: INode,
	operation: string,
	providedValue: unknown,
	itemIndex?: number,
): never {
	throw new PalGateValidationError(
		node,
		'Phone number is required and cannot be empty',
		{
			operation,
			resource: 'User',
			requestBody: { phone: providedValue } as JsonObject,
			timestamp: new Date().toISOString(),
		},
		itemIndex,
	);
}

export function throwEmptyPhonesArrayError(
	node: INode,
	operation: string,
	itemIndex?: number,
): never {
	throw new PalGateValidationError(
		node,
		'🚨 CRITICAL: Phones array is empty. This operation has been blocked to prevent deleting ALL users.',
		{
			operation,
			resource: 'User',
			timestamp: new Date().toISOString(),
		},
		itemIndex,
	);
}

export function throwPlaceIdRequiredError(
	node: INode,
	operation: string,
	itemIndex?: number,
): never {
	throw new PalGateValidationError(
		node,
		'Place ID is required',
		{
			operation,
			resource: 'Place',
			timestamp: new Date().toISOString(),
		},
		itemIndex,
	);
}
