import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect } from '../../shared/descriptions';
import { placeGetAllDescription } from './getAll';
import { placeGetTreeDescription } from './getTree';
import { placeGetDetailsDescription } from './getDetails';
import { placeUpdateDescription } from './update';
import { placeGetGroupsDescription } from './getGroups';
import { placeGetUsersDescription } from './getUsers';
import { placeFormatPhoneNumberDescription } from './formatPhoneNumber';

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
				name: 'Format Phone Number',
				value: 'formatPhoneNumber',
				action: 'Format phone number',
				description: 'Format phone number for a place',
				routing: {
					request: {
						method: 'GET',
						url: '=/place/{{$parameter.placeId}}/format-number',
						qs: {
							pn: '={{$parameter.phoneNumber}}',
						},
					},
				},
			},
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
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many places',
				description: 'Get many places',
				routing: {
					request: {
						method: 'GET',
						url: '=/place',
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
			{
				name: 'Update',
				value: 'update',
				action: 'Update a place',
				description: 'Update place information',
				routing: {
					request: {
						method: 'POST',
						url: '=/place/{{$parameter.placeId}}/general/edit',
					},
				},
			},
		],
		default: 'getAll',
	},
	{
		...placeIdSelect,
		displayOptions: {
			show: showOnlyForPlaces,
			hide: {
				operation: ['getAll', 'getTree'],
			},
		},
	},
	...placeGetAllDescription,
	...placeGetTreeDescription,
	...placeGetDetailsDescription,
	...placeUpdateDescription,
	...placeGetGroupsDescription,
	...placeGetUsersDescription,
	...placeFormatPhoneNumberDescription,
];
