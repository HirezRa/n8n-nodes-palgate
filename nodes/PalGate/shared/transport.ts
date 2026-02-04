import type {
	IHookFunctions,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { logRequest, logResponse, logError, logCriticalOperation } from './logger';

// Token cache: stores token and expiry time per credential set
const tokenCache: {
	[key: string]: { token: string; expiry: number };
} = {};

export async function getAuthToken(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
): Promise<string> {
	// Get credentials
	const credentials = await this.getCredentials('palGateApi');
	const username = credentials.username as string;
	const password = credentials.password as string;

	// Create cache key based on username
	const cacheKey = `pal_gate_${username}`;

	// Check if we have a valid cached token
	const cached = tokenCache[cacheKey];
	const now = Date.now();

	if (cached && cached.expiry > now) {
		// Use cached token
		return cached.token;
	}

	// Perform login to get token
	const loginUrl = 'https://portal.pal-es.com/api1/user/login1';
	const loginPayload = {
		username,
		password,
	};

	try {
		const loginResponse = await this.helpers.httpRequest({
			method: 'POST',
			url: loginUrl,
			body: loginPayload,
			json: true,
		});

		// Extract token from response
		if (
			loginResponse &&
			loginResponse.user &&
			loginResponse.user.token
		) {
			const token = loginResponse.user.token;

			// Cache token for 23 hours (token expires in 24 hours)
			tokenCache[cacheKey] = {
				token,
				expiry: now + 23 * 60 * 60 * 1000, // 23 hours in milliseconds
			};

			return token;
		} else {
			throw new Error(
				'Invalid login response: token not found in response. Response structure: ' +
					JSON.stringify(loginResponse),
			);
		}
	} catch (error: unknown) {
		// Clear cache on error
		delete tokenCache[cacheKey];

		const errorObj = error as {
			message?: string;
			statusCode?: number | string;
			code?: number | string;
			response?: { body?: unknown; data?: unknown };
			body?: unknown;
		};

		const errorMessage = errorObj.message || 'Login failed: Unknown error';
		const statusCode = errorObj.statusCode || errorObj.code || 'Unknown';
		const responseBody = errorObj.response?.body || errorObj.response?.data || errorObj.body || '';

		let detailedError = `PAL Portal authentication failed: ${errorMessage}`;
		if (statusCode !== 'Unknown') {
			detailedError += ` (Status: ${statusCode})`;
		}
		if (responseBody) {
			const bodyStr =
				typeof responseBody === 'string'
					? responseBody
					: JSON.stringify(responseBody);
			detailedError += ` - Response: ${bodyStr}`;
		}

		throw new Error(detailedError);
	}
}

export async function palGateApiRequest(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	qs: IDataObject = {},
	body: IDataObject | undefined = undefined,
) {
	// Determine operation name from resource and method
	const operation = `${method} ${resource}`;
	
	// Check if this is a critical operation (DELETE)
	const isCriticalOperation = method === 'DELETE' || resource.includes('delete');
	
	// Log request details (with critical warning if needed)
	if (isCriticalOperation) {
		logCriticalOperation(operation, {
			method,
			resource,
			url: `https://portal.pal-es.com/api1${resource}`,
			queryParams: Object.keys(qs).length > 0 ? qs : undefined,
			body: body,
			warning: 'This is a destructive operation - verify all parameters before proceeding!',
		});
	} else {
		logRequest(operation, {
			method,
			resource,
			url: `https://portal.pal-es.com/api1${resource}`,
			queryParams: Object.keys(qs).length > 0 ? qs : undefined,
			body: body,
			hasAuthToken: true,
		});
	}

	try {
		// Get authentication token
		const token = await getAuthToken.call(this);

		const options: IHttpRequestOptions = {
			method,
			qs,
			body,
			url: `https://portal.pal-es.com/api1${resource}`,
			json: true,
			headers: {
				'X-Access-Token': token,
				'Content-Type': 'application/json',
			},
		};

		const response = await this.helpers.httpRequest(options);
		
		// Log successful response
		const statusCode = (response as { statusCode?: number }).statusCode || 200;
		logResponse(operation, statusCode, response);
		
		return response;
	} catch (error) {
		// Log error with full context
		const errorObj = error as {
			message?: string;
			statusCode?: number;
			code?: number | string;
			response?: { body?: unknown; data?: unknown; statusCode?: number };
			body?: unknown;
		};
		
		const statusCodeRaw = errorObj.statusCode || errorObj.code || errorObj.response?.statusCode;
		const statusCode = typeof statusCodeRaw === 'number' ? statusCodeRaw : 
		                  typeof statusCodeRaw === 'string' ? parseInt(statusCodeRaw, 10) : undefined;
		const errorResponse = errorObj.response?.body || errorObj.response?.data || errorObj.body;
		
		logError(operation, error, {
			method,
			resource,
			url: `https://portal.pal-es.com/api1${resource}`,
			queryParams: Object.keys(qs).length > 0 ? qs : undefined,
			body: body,
			statusCode: statusCode,
			errorResponse: errorResponse,
		});
		
		// Enhance error message with detailed context
		const originalMessage = errorObj.message || 'Unknown error';
		let enhancedMessage = `PAL Portal API request failed: ${originalMessage}`;
		
		if (statusCode !== undefined && !isNaN(statusCode)) {
			enhancedMessage += ` (HTTP ${statusCode})`;
			
			// Add helpful messages for common status codes
			if (statusCode === 401) {
				enhancedMessage += ' - Authentication failed. Please check your credentials.';
			} else if (statusCode === 403) {
				enhancedMessage += ' - Access forbidden. You may not have permission for this operation.';
			} else if (statusCode === 404) {
				enhancedMessage += ` - Resource not found. Please verify the ${resource.includes('place') ? 'Place ID' : resource.includes('user') ? 'User' : 'resource'} exists.`;
			} else if (statusCode === 400) {
				enhancedMessage += ' - Bad request. Please check your input parameters.';
			} else if (statusCode === 409) {
				enhancedMessage += ' - Conflict. The resource may already exist.';
			} else if (statusCode >= 500) {
				enhancedMessage += ' - Server error. Please try again later or contact support.';
			}
		}
		
		if (errorResponse) {
			const responseStr = typeof errorResponse === 'string' 
				? errorResponse 
				: JSON.stringify(errorResponse);
			enhancedMessage += `\n\nResponse details: ${responseStr}`;
		}
		
		enhancedMessage += `\n\nOperation: ${method} ${resource}`;
		if (body && Object.keys(body).length > 0) {
			enhancedMessage += `\nRequest body: ${JSON.stringify(body, null, 2)}`;
		}
		
		// Create new error with enhanced message
		const enhancedError = new Error(enhancedMessage);
		(enhancedError as { statusCode?: number; code?: number | string; response?: unknown }).statusCode = statusCode;
		(enhancedError as { statusCode?: number; code?: number | string; response?: unknown }).code = statusCodeRaw;
		(enhancedError as { statusCode?: number; code?: number | string; response?: unknown }).response = errorObj.response;
		
		throw enhancedError;
	}
}

