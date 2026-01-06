import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PalGateApi implements ICredentialType {
	name = 'palGateApi';

	displayName = 'PAL Gate API';

	icon: Icon = 'file:icon.svg';

	documentationUrl = 'https://portal.pal-es.com';

	properties: INodeProperties[] = [
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			required: true,
			description: 'PAL Portal username/email',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'PAL Portal password',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			// Authentication is handled in transport.ts via login
			// This is a placeholder - actual auth happens in palGateApiRequest
		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			url: 'https://portal.pal-es.com/api1/user/login1',
			body: {
				username: '={{$credentials.username}}',
				password: '={{$credentials.password}}',
			},
		},
	};
}
