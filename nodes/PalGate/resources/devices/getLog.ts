import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDeviceGetLog = {
	operation: ['getLog'],
	resource: ['device'],
};

export const deviceGetLogDescription: INodeProperties[] = [
	// serialSelect is defined in index.ts to avoid duplication
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: { show: showOnlyForDeviceGetLog },
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
				...showOnlyForDeviceGetLog,
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
		displayOptions: { show: showOnlyForDeviceGetLog },
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
		displayOptions: { show: showOnlyForDeviceGetLog },
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
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		displayOptions: { show: showOnlyForDeviceGetLog },
		default: '',
		routing: {
			send: {
				type: 'query',
				property: 'startDate',
			},
		},
		description: 'Start date for log filtering',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		displayOptions: { show: showOnlyForDeviceGetLog },
		default: '',
		routing: {
			send: {
				type: 'query',
				property: 'endDate',
			},
		},
		description: 'End date for log filtering',
	},
	{
		displayName: 'Approved',
		name: 'approved',
		type: 'boolean',
		displayOptions: { show: showOnlyForDeviceGetLog },
		default: false,
		routing: {
			send: {
				type: 'query',
				property: 'approved',
			},
		},
		description: 'Whether to filter by approval status',
	},
];
