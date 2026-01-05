import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect, phoneSelect } from '../../shared/descriptions';

const showOnlyForCarDelete = {
	operation: ['delete'],
	resource: ['car'],
};

export const carDeleteDescription: INodeProperties[] = [
	{
		...placeIdSelect,
		displayOptions: { show: showOnlyForCarDelete },
	},
	{
		...phoneSelect,
		displayOptions: { show: showOnlyForCarDelete },
	},
	{
		displayName: 'Car ID',
		name: 'carId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: showOnlyForCarDelete },
		description: 'Car ID to delete',
	},
];
