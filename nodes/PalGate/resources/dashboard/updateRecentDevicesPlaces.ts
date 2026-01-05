import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDashboardUpdateRecentDevicesPlaces = {
	operation: ['updateRecentDevicesPlaces'],
	resource: ['dashboard'],
};

export const dashboardUpdateRecentDevicesPlacesDescription: INodeProperties[] = [
	{
		displayName: 'Devices',
		name: 'devices',
		type: 'string',
		typeOptions: {
			multipleValues: true,
		},
		default: [],
		displayOptions: { show: showOnlyForDashboardUpdateRecentDevicesPlaces },
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
		displayOptions: { show: showOnlyForDashboardUpdateRecentDevicesPlaces },
		description: 'List of place IDs',
		routing: {
			send: {
				type: 'body',
				property: 'places',
			},
		},
	},
];

