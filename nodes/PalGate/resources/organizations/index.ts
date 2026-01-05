import type { INodeProperties } from 'n8n-workflow';
import { orgIdSelect } from '../../shared/descriptions';
import { orgGetTreeDescription } from './getTree';
import { orgGetDetailsDescription } from './getDetails';

const showOnlyForOrganizations = {
	resource: ['organization'],
};

export const organizationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForOrganizations,
		},
		options: [
			{
				name: 'Get Tree',
				value: 'getTree',
				action: 'Get organizations tree',
				description: 'Get hierarchical tree of organizations',
				routing: {
					request: {
						method: 'GET',
						url: '=/orgs-tree',
					},
				},
			},
			{
				name: 'Get Details',
				value: 'getDetails',
				action: 'Get an organization',
				description: 'Get details of a specific organization',
				routing: {
					request: {
						method: 'GET',
						url: '=/org/{{$parameter.orgId}}',
					},
				},
			},
		],
		default: 'getTree',
	},
	{
		...orgIdSelect,
		displayOptions: {
			show: showOnlyForOrganizations,
			hide: {
				operation: ['getTree'],
			},
		},
	},
	...orgGetTreeDescription,
	...orgGetDetailsDescription,
];
