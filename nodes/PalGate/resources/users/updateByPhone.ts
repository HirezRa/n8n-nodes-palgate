import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect, phoneSelect } from '../../shared/descriptions';

const showOnlyForUserUpdateByPhone = {
	operation: ['updateByPhone'],
	resource: ['user'],
};

export const userUpdateByPhoneDescription: INodeProperties[] = [
	{
		...placeIdSelect,
		displayOptions: { show: showOnlyForUserUpdateByPhone },
	},
	{
		...phoneSelect,
		displayOptions: { show: showOnlyForUserUpdateByPhone },
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		displayOptions: { show: showOnlyForUserUpdateByPhone },
		description: 'Full name (optional)',
		routing: {
			send: {
				type: 'body',
				property: 'name',
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
		displayOptions: { show: showOnlyForUserUpdateByPhone },
		description: 'List of car numbers (optional)',
		routing: {
			send: {
				type: 'body',
				property: 'cars',
				value: '={{$value || []}}',
			},
		},
	},
];

