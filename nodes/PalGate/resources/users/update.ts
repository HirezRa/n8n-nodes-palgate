import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect, phoneSelect } from '../../shared/descriptions';

const showOnlyForUserUpdate = {
	operation: ['update'],
	resource: ['user'],
};

export const userUpdateDescription: INodeProperties[] = [
	{
		...placeIdSelect,
		displayOptions: { show: showOnlyForUserUpdate },
	},
	{
		...phoneSelect,
		displayOptions: { show: showOnlyForUserUpdate },
	},
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: showOnlyForUserUpdate },
		description: 'User first name',
		routing: {
			send: {
				type: 'body',
				property: 'firstname',
			},
		},
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: showOnlyForUserUpdate },
		description: 'User last name',
		routing: {
			send: {
				type: 'body',
				property: 'lastname',
			},
		},
	},
];

