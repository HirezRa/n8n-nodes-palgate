import type { INodeProperties } from 'n8n-workflow';
import { orgIdSelect } from '../../shared/descriptions';

const showOnlyForOrgGetDetails = {
	operation: ['getDetails'],
	resource: ['organization'],
};

export const orgGetDetailsDescription: INodeProperties[] = [
	{
		...orgIdSelect,
		displayOptions: { show: showOnlyForOrgGetDetails },
	},
];

