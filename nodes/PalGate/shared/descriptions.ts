import type { INodeProperties } from 'n8n-workflow';

export const placeIdSelect: INodeProperties = {
	displayName: 'Place ID',
	name: 'placeId',
	type: 'string',
	default: '',
	required: true,
	description: 'The ID of the place',
};

export const phoneSelect: INodeProperties = {
	displayName: 'Phone Number',
	name: 'phone',
	type: 'string',
	default: '',
	required: true,
	description: 'Phone number (e.g., 972501234567)',
};

export const serialSelect: INodeProperties = {
	displayName: 'Serial Number',
	name: 'serial',
	type: 'string',
	default: '',
	required: true,
	description: 'Device serial number',
};

export const orgIdSelect: INodeProperties = {
	displayName: 'Organization ID',
	name: 'orgId',
	type: 'number',
	default: 0,
	required: true,
};

