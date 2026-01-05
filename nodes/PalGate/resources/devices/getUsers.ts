import type { INodeProperties } from 'n8n-workflow';
import { serialSelect } from '../../shared/descriptions';

const showOnlyForDeviceGetUsers = {
	operation: ['getUsers'],
	resource: ['device'],
};

export const deviceGetUsersDescription: INodeProperties[] = [
	{
		...serialSelect,
		displayOptions: { show: showOnlyForDeviceGetUsers },
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: { show: showOnlyForDeviceGetUsers },
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
				...showOnlyForDeviceGetUsers,
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
		displayOptions: { show: showOnlyForDeviceGetUsers },
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
		displayOptions: { show: showOnlyForDeviceGetUsers },
		default: '',
		routing: {
			send: {
				type: 'query',
				property: 'filter',
			},
		},
		description: 'Optional search filter',
	},
];

