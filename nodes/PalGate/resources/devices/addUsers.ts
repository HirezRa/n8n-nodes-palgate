import type { INodeProperties } from 'n8n-workflow';
import { serialSelect } from '../../shared/descriptions';

const showOnlyForDeviceAddUsers = {
	operation: ['addUsers'],
	resource: ['device'],
};

export const deviceAddUsersDescription: INodeProperties[] = [
	{
		...serialSelect,
		displayOptions: { show: showOnlyForDeviceAddUsers },
	},
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
