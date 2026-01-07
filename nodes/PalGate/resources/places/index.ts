import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect } from '../../shared/descriptions';
import { placeGetTreeDescription } from './getTree';
import { placeGetDetailsDescription } from './getDetails';
import { placeGetGroupsDescription } from './getGroups';
import { placeGetUsersDescription } from './getUsers';

const showOnlyForPlaces = {
	resource: ['place'],
};

export const placeDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForPlaces,
		},
		options: [
			{
				name: 'Get Details',
				value: 'getDetails',
				action: 'Get a place',
				description: 'Get details of a specific place',
				routing: {
					request: {
						method: 'GET',
						url: '=/place/{{$parameter.placeId}}',
					},
				},
			},
			{
				name: 'Get Groups',
				value: 'getGroups',
				action: 'Get place groups',
				description: 'Get groups for a place',
				routing: {
					request: {
						method: 'GET',
						url: '=/place/{{$parameter.placeId}}/groups',
					},
				},
			},
			{
				name: 'Get Tree',
				value: 'getTree',
				action: 'Get places tree',
				description: 'Get places in tree structure',
				routing: {
					request: {
						method: 'GET',
						url: '=/places-tree',
					},
				},
			},
			{
				name: 'Get Users',
				value: 'getUsers',
				action: 'Get place users',
				description: 'Get users for a place',
				routing: {
					request: {
						method: 'GET',
						url: '=/place/{{$parameter.placeId}}/users',
					},
				},
			},
		],
		default: 'getTree',
	},
	{
		...placeIdSelect,
		displayOptions: {
			show: showOnlyForPlaces,
			hide: {
				operation: ['getTree'],
			},
		},
	},
	...placeGetTreeDescription,
	...placeGetDetailsDescription,
	...placeGetGroupsDescription,
	...placeGetUsersDescription,
];
