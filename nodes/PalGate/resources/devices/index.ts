import type { INodeProperties } from 'n8n-workflow';
import { serialSelect } from '../../shared/descriptions';
import { deviceGetAllDescription } from './getAll';
import { deviceGetDetailsDescription } from './getDetails';
import { deviceGetLogDescription } from './getLog';
import { deviceGetUsersDescription } from './getUsers';
import { deviceGetLiveStatusHistoryDescription } from './getLiveStatusHistory';
import { deviceGetStatusHistoryV2Description } from './getStatusHistoryV2';

const showOnlyForDevices = {
	resource: ['device'],
};

export const deviceDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForDevices,
		},
		options: [
			{
				name: 'Get Details',
				value: 'getDetails',
				action: 'Get a device',
				description: 'Get details of a specific device',
				routing: {
					request: {
						method: 'GET',
						url: '=/device/{{$parameter.serial}}',
					},
				},
			},
			{
				name: 'Get Live Status History',
				value: 'getLiveStatusHistory',
				action: 'Get live status history',
				description: 'Get live status history for a device',
				routing: {
					request: {
						method: 'GET',
						url: '=/device/{{$parameter.serial}}/live-status-history',
					},
				},
			},
			{
				name: 'Get Log',
				value: 'getLog',
				action: 'Get device log',
				description: 'Get log entries for a device',
				routing: {
					request: {
						method: 'GET',
						url: '=/device/{{$parameter.serial}}/log',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many devices',
				description: 'Get many devices',
				routing: {
					request: {
						method: 'GET',
						url: '=/devices',
					},
				},
			},
			{
				name: 'Get Status History V2',
				value: 'getStatusHistoryV2',
				action: 'Get status history v2',
				description: 'Get status history v2 for a device',
				routing: {
					request: {
						method: 'GET',
						url: '=/device/{{$parameter.serial}}/get-status-historyV2',
					},
				},
			},
			{
				name: 'Get Users',
				value: 'getUsers',
				action: 'Get device users',
				description: 'Get users for a device',
				routing: {
					request: {
						method: 'GET',
						url: '=/device/{{$parameter.serial}}/users',
					},
				},
			},
		],
		default: 'getAll',
	},
	{
		...serialSelect,
		displayOptions: {
			show: showOnlyForDevices,
			hide: {
				operation: ['getAll'],
			},
		},
	},
	...deviceGetAllDescription,
	...deviceGetDetailsDescription,
	...deviceGetLogDescription,
	...deviceGetUsersDescription,
	...deviceGetLiveStatusHistoryDescription,
	...deviceGetStatusHistoryV2Description,
];
