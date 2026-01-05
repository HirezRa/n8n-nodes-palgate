import type { INodeProperties } from 'n8n-workflow';
import { serialSelect } from '../../shared/descriptions';

const showOnlyForDeviceUpdateSettings = {
	operation: ['updateSettings'],
	resource: ['device'],
};

export const deviceUpdateSettingsDescription: INodeProperties[] = [
	{
		...serialSelect,
		displayOptions: { show: showOnlyForDeviceUpdateSettings },
	},
	{
		displayName: 'Settings',
		name: 'settings',
		type: 'json',
		default: '{}',
		required: true,
		displayOptions: { show: showOnlyForDeviceUpdateSettings },
		description: 'Device settings as JSON object',
		routing: {
			send: {
				type: 'body',
				property: '=',
				value: '={{JSON.parse($value)}}',
			},
		},
	},
];
