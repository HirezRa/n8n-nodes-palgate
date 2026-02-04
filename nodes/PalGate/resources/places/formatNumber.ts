import type { INodeProperties } from 'n8n-workflow';
import { phoneSelect } from '../../shared/descriptions';

const showOnlyForPlaceFormatNumber = {
	operation: ['formatNumber'],
	resource: ['place'],
};

export const placeFormatNumberDescription: INodeProperties[] = [
	{
		...phoneSelect,
		displayOptions: { show: showOnlyForPlaceFormatNumber },
		routing: {
			send: {
				type: 'query',
				property: 'pn',
			},
		},
		description: 'Phone number to format (e.g. 972528888888)',
	},
];
