import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect } from '../../shared/descriptions';

const showOnlyForPlaceFormatPhoneNumber = {
	operation: ['formatPhoneNumber'],
	resource: ['place'],
};

export const placeFormatPhoneNumberDescription: INodeProperties[] = [
	{
		...placeIdSelect,
		displayOptions: { show: showOnlyForPlaceFormatPhoneNumber },
	},
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: showOnlyForPlaceFormatPhoneNumber },
		description: 'Phone number to format',
	},
];
