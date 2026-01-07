import type { INodeProperties } from 'n8n-workflow';
import { phoneSelect } from '../../shared/descriptions';

const showOnlyForCarAdd = {
	operation: ['add'],
	resource: ['car'],
};

export const carAddDescription: INodeProperties[] = [
	// placeIdSelect is defined in index.ts to avoid duplication
	{
		...phoneSelect,
		displayOptions: { show: showOnlyForCarAdd },
		routing: {
			send: {
				type: 'body',
				property: 'userId',
			},
		},
	},
	{
		displayName: 'Car Number',
		name: 'carNumber',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: showOnlyForCarAdd },
		description: 'Car number/ID',
		routing: {
			send: {
				type: 'body',
				property: 'carId',
			},
		},
	},
	{
		displayName: 'Color',
		name: 'color',
		type: 'color',
		default: '',
		displayOptions: { show: showOnlyForCarAdd },
		description: 'Car color (optional)',
		routing: {
			send: {
				type: 'body',
				property: 'color',
			},
		},
	},
];
