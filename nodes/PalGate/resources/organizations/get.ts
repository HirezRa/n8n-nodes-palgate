import type { INodeProperties } from 'n8n-workflow';
import { orgIdSelect } from '../../shared/descriptions';

const showOnlyForOrgGet = {
	operation: ['get'],
	resource: ['organization'],
};

export const orgGetDescription: INodeProperties[] = [
	{
		...orgIdSelect,
		displayOptions: { show: showOnlyForOrgGet },
	},
];

