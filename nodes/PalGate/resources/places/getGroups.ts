import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect } from '../../shared/descriptions';

const showOnlyForPlaceGetGroups = {
	operation: ['getGroups'],
	resource: ['place'],
};

export const placeGetGroupsDescription: INodeProperties[] = [
	{
		...placeIdSelect,
		displayOptions: { show: showOnlyForPlaceGetGroups },
	},
];

