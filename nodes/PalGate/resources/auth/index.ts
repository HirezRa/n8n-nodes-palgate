import type { INodeProperties } from 'n8n-workflow';

const showOnlyForAuth = {
	resource: ['auth'],
};

export const authDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForAuth,
		},
		options: [
			{
				name: 'Test Connection',
				value: 'testConnection',
				action: 'Test connection to pal gate',
				description:
					'Verify that credentials are valid and the connection to the PAL Gate portal works. Uses a minimal API call (places tree).',
				routing: {
					request: {
						method: 'GET',
						url: '/places-tree',
						qs: {
							skip: 0,
							limit: 1,
						},
					},
				},
			},
		],
		default: 'testConnection',
	},
];
