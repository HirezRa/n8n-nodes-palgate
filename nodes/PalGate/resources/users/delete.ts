import type { INodeProperties } from 'n8n-workflow';
import { phoneSelect } from '../../shared/descriptions';

const showOnlyForUserDelete = {
	operation: ['delete'],
	resource: ['user'],
};

export const userDeleteDescription: INodeProperties[] = [
	// placeIdSelect is defined in index.ts to avoid duplication
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

