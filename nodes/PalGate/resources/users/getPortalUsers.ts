import type { INodeProperties } from 'n8n-workflow';

const showOnlyForUserGetPortalUsers = {
	operation: ['getPortalUsers'],
	resource: ['user'],
};

export const userGetPortalUsersDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: { show: showOnlyForUserGetPortalUsers },
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: {
				paginate: '={{ $value }}',
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForUserGetPortalUsers,
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
			output: {
				maxResults: '={{$value}}',
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Skip',
		name: 'skip',
		type: 'number',
		displayOptions: { show: showOnlyForUserGetPortalUsers },
		typeOptions: {
			minValue: 0,
		},
		default: 0,
		routing: {
			send: {
				type: 'query',
				property: 'skip',
			},
		},
		description: 'Number of records to skip',
	},
	{
		displayName: 'Filter',
		name: 'filter',
		type: 'string',
		displayOptions: { show: showOnlyForUserGetPortalUsers },
		default: '',
		routing: {
			send: {
				type: 'query',
				property: 'filter',
			},
		},
		description: 'Optional search filter',
	},
	{
		displayName: 'Organization ID',
		name: 'orgId',
		type: 'number',
		displayOptions: { show: showOnlyForUserGetPortalUsers },
		default: '',
		routing: {
			send: {
				type: 'query',
				property: 'orgId',
			},
		},
		description: 'Optional organization ID filter',
	},
	{
		displayName: 'Subscription',
		name: 'subscription',
		type: 'string',
		displayOptions: { show: showOnlyForUserGetPortalUsers },
		default: '',
		routing: {
			send: {
				type: 'query',
				property: 'subscription',
			},
		},
		description: 'Optional subscription filter',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'string',
		displayOptions: { show: showOnlyForUserGetPortalUsers },
		default: '',
		routing: {
			send: {
				type: 'query',
				property: 'status',
			},
		},
		description: 'Optional status filter',
	},
];

