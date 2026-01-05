import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect, phoneSelect } from '../../shared/descriptions';

const showOnlyForCarDeleteById = {
	operation: ['deleteById'],
	resource: ['car'],
};

export const carDeleteByIdDescription: INodeProperties[] = [
	{
		...placeIdSelect,
		displayOptions: { show: showOnlyForCarDeleteById },
	},
	{
		...phoneSelect,
		displayOptions: { show: showOnlyForCarDeleteById },
	},
	{
		displayName: 'Car ID',
		name: 'carId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: showOnlyForCarDeleteById },
		description: 'Car ID to delete',
	},
];

