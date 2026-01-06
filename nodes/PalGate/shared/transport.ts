import type {
	IHookFunctions,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

// Token cache: stores token and expiry time per credential set
const tokenCache: {
	[key: string]: { token: string; expiry: number };
} = {};

async function getAuthToken(
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

	return this.helpers.httpRequest(options);
}

