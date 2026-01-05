import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect } from '../../shared/descriptions';

const showOnlyForPlaceUpdate = {
	operation: ['update'],
	resource: ['place'],
};

export const placeUpdateDescription: INodeProperties[] = [
	{
		...placeIdSelect,
		displayOptions: { show: showOnlyForPlaceUpdate },
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: { show: showOnlyForPlaceUpdate },
		default: '',
		description: 'Place name',
		routing: {
			send: {
				type: 'body',
				property: 'name',
			},
		},
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		displayOptions: { show: showOnlyForPlaceUpdate },
		default: '',
		description: 'Place address',
		routing: {
			send: {
				type: 'body',
				property: 'address',
			},
		},
	},
];
