import type { INodeProperties } from 'n8n-workflow';
import { phoneSelect } from '../../shared/descriptions';

const showOnlyForUserAdd = {
	operation: ['add'],
	resource: ['user'],
};

export const userAddDescription: INodeProperties[] = [
	// placeIdSelect is defined in index.ts to avoid duplication
	{
		...phoneSelect,
		displayOptions: { show: showOnlyForUserAdd },
		routing: {
			send: {
				type: 'body',
				property: 'id',
			},
		},
	},
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: showOnlyForUserAdd },
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
		displayOptions: { show: showOnlyForUserAdd },
		description: 'User last name',
		routing: {
			send: {
				type: 'body',
				property: 'lastname',
			},
		},
	},
	{
		displayName: 'Cars',
		name: 'cars',
		type: 'string',
		typeOptions: {
			multipleValues: true,
		},
		default: [],
		displayOptions: { show: showOnlyForUserAdd },
		description: 'List of car numbers',
		routing: {
			send: {
				type: 'body',
				property: 'cars',
				value: '={{$value || []}}',
			},
		},
	},
];

