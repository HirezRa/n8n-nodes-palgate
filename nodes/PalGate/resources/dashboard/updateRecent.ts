import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDashboardUpdateRecent = {
	operation: ['updateRecent'],
	resource: ['dashboard'],
};

export const dashboardUpdateRecentDescription: INodeProperties[] = [
	{
		displayName: 'Devices',
		name: 'devices',
		type: 'string',
		typeOptions: {
			multipleValues: true,
		},
		default: [],
		displayOptions: { show: showOnlyForDashboardUpdateRecent },
		description: 'List of device serial numbers',
		routing: {
			send: {
				type: 'body',
				property: 'devices',
			},
		},
	},
	{
		displayName: 'Places',
		name: 'places',
		type: 'string',
		typeOptions: {
			multipleValues: true,
		},
		default: [],
		displayOptions: { show: showOnlyForDashboardUpdateRecent },
		description: 'List of place IDs',
		routing: {
			send: {
				type: 'body',
				property: 'places',
			},
		},
	},
];
