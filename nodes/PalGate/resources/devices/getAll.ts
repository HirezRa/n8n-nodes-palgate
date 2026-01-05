import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDeviceGetAll = {
	operation: ['getAll'],
	resource: ['device'],
};

export const deviceGetAllDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: { show: showOnlyForDeviceGetAll },
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
				...showOnlyForDeviceGetAll,
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
		displayOptions: { show: showOnlyForDeviceGetAll },
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
		displayOptions: { show: showOnlyForDeviceGetAll },
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
		displayName: 'Connected',
		name: 'connected',
		type: 'boolean',
		displayOptions: { show: showOnlyForDeviceGetAll },
		default: false,
		routing: {
			send: {
				type: 'query',
				property: 'connected',
			},
		},
		description: 'Whether to filter by connection status',
	},
	{
		displayName: 'Models',
		name: 'models',
		type: 'string',
		displayOptions: { show: showOnlyForDeviceGetAll },
		default: '',
		routing: {
			send: {
				type: 'query',
				property: 'models',
			},
		},
		description: 'Comma-separated list of device models',
	},
	{
		displayName: 'Types',
		name: 'types',
		type: 'string',
		displayOptions: { show: showOnlyForDeviceGetAll },
		default: '',
		routing: {
			send: {
				type: 'query',
				property: 'types',
			},
		},
		description: 'Comma-separated list of device types',
	},
	{
		displayName: 'Versions',
		name: 'versions',
		type: 'string',
		displayOptions: { show: showOnlyForDeviceGetAll },
		default: '',
		routing: {
			send: {
				type: 'query',
				property: 'versions',
			},
		},
		description: 'Comma-separated list of device versions',
	},
	{
		displayName: 'Organization ID',
		name: 'orgId',
		type: 'number',
		displayOptions: { show: showOnlyForDeviceGetAll },
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
		displayName: 'Sort By Health',
		name: 'sortByHealth',
		type: 'boolean',
		displayOptions: { show: showOnlyForDeviceGetAll },
		default: false,
		routing: {
			send: {
				type: 'query',
				property: 'sortByHealth',
			},
		},
		description: 'Whether to sort results by health status',
	},
];
