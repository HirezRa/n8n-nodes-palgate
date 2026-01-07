import type { INodeProperties } from 'n8n-workflow';
import { phoneSelect } from '../../shared/descriptions';

const showOnlyForCarDeleteById = {
	operation: ['deleteById'],
	resource: ['car'],
};

export const carDeleteByIdDescription: INodeProperties[] = [
	// placeIdSelect is defined in index.ts to avoid duplication
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

