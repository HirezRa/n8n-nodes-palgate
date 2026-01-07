import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDeviceAddUsers = {
	operation: ['addUsers'],
	resource: ['device'],
};

export const deviceAddUsersDescription: INodeProperties[] = [
	// serialSelect is defined in index.ts to avoid duplication
	{
		displayName: 'Users',
		name: 'users',
		type: 'string',
		typeOptions: {
			multipleValues: true,
		},
		default: [],
		required: true,
		displayOptions: { show: showOnlyForDeviceAddUsers },
		description: 'List of user phone numbers to add',
		routing: {
			send: {
				type: 'body',
				property: 'users',
			},
		},
	},
];
