import type { INodeProperties } from 'n8n-workflow';

const showOnlyForPlaceGetTree = {
	operation: ['getTree'],
	resource: ['place'],
};

export const placeGetTreeDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: { show: showOnlyForPlaceGetTree },
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
				...showOnlyForPlaceGetTree,
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
		displayOptions: { show: showOnlyForPlaceGetTree },
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
		displayOptions: { show: showOnlyForPlaceGetTree },
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
		displayName: 'Parent Place ID',
		name: 'parentPlaceId',
		type: 'string',
		displayOptions: { show: showOnlyForPlaceGetTree },
		default: '',
		routing: {
			send: {
				type: 'query',
				property: 'placeId',
			},
		},
		description: 'Optional parent place ID for tree filtering',
	},
];
