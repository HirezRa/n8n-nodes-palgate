import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect } from '../../shared/descriptions';

const showOnlyForPlaceGet = {
	operation: ['get'],
	resource: ['place'],
};

export const placeGetDescription: INodeProperties[] = [
	{
		...placeIdSelect,
		displayOptions: { show: showOnlyForPlaceGet },
	},
];

