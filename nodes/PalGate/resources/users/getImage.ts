import type { INodeProperties } from 'n8n-workflow';
import { phoneSelect } from '../../shared/descriptions';

const showOnlyForUserGetImage = {
	operation: ['getImage'],
	resource: ['user'],
};

export const userGetImageDescription: INodeProperties[] = [
	{
		...phoneSelect,
		displayOptions: { show: showOnlyForUserGetImage },
	},
];

