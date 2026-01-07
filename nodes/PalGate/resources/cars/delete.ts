import type { INodeProperties } from 'n8n-workflow';
import { phoneSelect } from '../../shared/descriptions';

const showOnlyForCarDelete = {
	operation: ['delete'],
	resource: ['car'],
};

export const carDeleteDescription: INodeProperties[] = [
	// placeIdSelect is defined in index.ts to avoid duplication
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
