import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect, phoneSelect } from '../../shared/descriptions';

const showOnlyForUserFind = {
	operation: ['find'],
	resource: ['user'],
};

export const userFindDescription: INodeProperties[] = [
	{
		...placeIdSelect,
		displayOptions: { show: showOnlyForUserFind },
	},
	{
		...phoneSelect,
		displayOptions: { show: showOnlyForUserFind },
	},
];

