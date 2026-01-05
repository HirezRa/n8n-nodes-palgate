import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect } from '../../shared/descriptions';

const showOnlyForPlaceGetDetails = {
	operation: ['getDetails'],
	resource: ['place'],
};

export const placeGetDetailsDescription: INodeProperties[] = [
	{
		...placeIdSelect,
		displayOptions: { show: showOnlyForPlaceGetDetails },
	},
];

