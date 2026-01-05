import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect, phoneSelect } from '../../shared/descriptions';

const showOnlyForUserDelete = {
	operation: ['delete'],
	resource: ['user'],
};

export const userDeleteDescription: INodeProperties[] = [
	{
		...placeIdSelect,
		displayOptions: { show: showOnlyForUserDelete },
	},
	{
		...phoneSelect,
		displayOptions: { show: showOnlyForUserDelete },
		routing: {
			send: {
				type: 'body',
				property: 'userList',
				value: '=[{{$value}}]',
			},
		},
	},
];

