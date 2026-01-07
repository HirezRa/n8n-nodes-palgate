import type { INodeProperties } from 'n8n-workflow';

const showOnlyForPlaceFormatPhoneNumber = {
	operation: ['formatPhoneNumber'],
	resource: ['place'],
};

export const placeFormatPhoneNumberDescription: INodeProperties[] = [
	// placeIdSelect is defined in index.ts to avoid duplication
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
