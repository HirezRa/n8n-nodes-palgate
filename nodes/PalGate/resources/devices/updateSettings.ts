import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDeviceUpdateSettings = {
	operation: ['updateSettings'],
	resource: ['device'],
};

export const deviceUpdateSettingsDescription: INodeProperties[] = [
	// serialSelect is defined in index.ts to avoid duplication
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
