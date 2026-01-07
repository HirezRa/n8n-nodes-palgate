import type { INodeProperties } from 'n8n-workflow';

const showOnlyForPlaceGetUsers = {
	operation: ['getUsers'],
	resource: ['place'],
};

export const placeGetUsersDescription: INodeProperties[] = [
	// placeIdSelect is defined in index.ts to avoid duplication
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: { show: showOnlyForPlaceGetUsers },
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: {
				paginate: '={{ $value }}',
				type: 'query',
				property: 'limit',
				value: '=100',
			},
			operations: {
				pagination: {
					type: 'offset',
					properties: {
						type: 'query',
						limitParameter: 'limit',
						offsetParameter: 'skip',
						pageSize: 100,
						rootProperty: 'users.list',
					},
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForPlaceGetUsers,
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
		displayOptions: { show: showOnlyForPlaceGetUsers },
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
		displayName: 'Phone Filter',
		name: 'phoneFilter',
		type: 'string',
		displayOptions: { show: showOnlyForPlaceGetUsers },
		default: '',
		routing: {
			send: {
				type: 'query',
				property: 'phoneFilter',
			},
		},
		description: 'Optional phone number filter',
	},
	{
		displayName: 'Name Filter',
		name: 'nameFilter',
		type: 'string',
		displayOptions: { show: showOnlyForPlaceGetUsers },
		default: '',
		routing: {
			send: {
				type: 'query',
				property: 'nameFilter',
			},
		},
		description: 'Optional name filter',
	},
];
