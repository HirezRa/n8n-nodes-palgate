import type { INodeProperties } from 'n8n-workflow';
import { dashboardGetFavoritesDescription } from './getFavorites';
import { dashboardGetRecentDescription } from './getRecent';
import { dashboardUpdateRecentDescription } from './updateRecent';
import { dashboardGetStatisticsDescription } from './getStatistics';
import { dashboardGetDevicesMarkersDescription } from './getDevicesMarkers';

const showOnlyForDashboard = {
	resource: ['dashboard'],
};

export const dashboardDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForDashboard,
		},
		options: [
			{
				name: 'Get Devices Markers',
				value: 'getDevicesMarkers',
				action: 'Get devices markers',
				description: 'Get devices markers for map',
				routing: {
					request: {
						method: 'GET',
						url: '=/devices-markers',
					},
				},
			},
			{
				name: 'Get Favorites',
				value: 'getFavorites',
				action: 'Get favorites',
				description: 'Get dashboard favorites',
				routing: {
					request: {
						method: 'GET',
						url: '=/user/admin/favorites',
					},
				},
			},
			{
				name: 'Get Recent',
				value: 'getRecent',
				action: 'Get recent devices and places',
				description: 'Get recent devices and places',
				routing: {
					request: {
						method: 'GET',
						url: '=/user/admin/recent-devices-places',
					},
				},
			},
			{
				name: 'Get Statistics',
				value: 'getStatistics',
				action: 'Get dashboard statistics',
				description: 'Get dashboard statistics',
				routing: {
					request: {
						method: 'GET',
						url: '=/user/dashboard/statistics',
					},
				},
			},
			{
				name: 'Update Recent',
				value: 'updateRecent',
				action: 'Update recent devices and places',
				description: 'Update recent devices and places',
				routing: {
					request: {
						method: 'PUT',
						url: '=/user/admin/recent-devices-places',
					},
				},
			},
		],
		default: 'getFavorites',
	},
	...dashboardGetFavoritesDescription,
	...dashboardGetRecentDescription,
	...dashboardUpdateRecentDescription,
	...dashboardGetStatisticsDescription,
	...dashboardGetDevicesMarkersDescription,
];
