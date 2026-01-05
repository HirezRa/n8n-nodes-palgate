import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect } from '../../shared/descriptions';
import { userFindDescription } from './find';
import { userAddDescription } from './add';
import { userAddManyDescription } from './addMany';
import { userUpdateDescription } from './update';
import { userUpdateByPhoneDescription } from './updateByPhone';
import { userDeleteDescription } from './delete';
import { userGetAllDescription } from './getAll';
import { userGetPortalUsersDescription } from './getPortalUsers';
import { userGetImageDescription } from './getImage';

const showOnlyForUsers = {
	resource: ['user'],
};

export const userDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForUsers,
		},
		options: [
			{
				name: 'Add',
				value: 'add',
				action: 'Add a user',
				description: 'Add a new user to a place',
				routing: {
					request: {
						method: 'POST',
						url: '=/place/{{$parameter.placeId}}/user',
					},
				},
			},
			{
				name: 'Add Many',
				value: 'addMany',
				action: 'Add multiple users',
				description: 'Add multiple users to a place in a single request',
				routing: {
					request: {
						method: 'POST',
						url: '=/place/{{$parameter.placeId}}/users',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a user',
				description: 'Delete a user from a place',
				routing: {
					request: {
						method: 'POST',
						url: '=/place/{{$parameter.placeId}}/delete-many-users',
					},
				},
			},
			{
				name: 'Find',
				value: 'find',
				action: 'Find a user by phone',
				description: 'Find user by phone number in a place',
				routing: {
					request: {
						method: 'GET',
						url: '=/place/{{$parameter.placeId}}/users',
						qs: {
							filter: '={{$parameter.phone}}',
						},
					},
				},
			},
			{
				name: 'Get Image',
				value: 'getImage',
				action: 'Get user image',
				description: 'Get user profile image',
				routing: {
					request: {
						method: 'GET',
						url: '=/app-user/{{$parameter.phone}}/image',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many app users',
				description: 'Get many app users (mobile users)',
				routing: {
					request: {
						method: 'GET',
						url: '=/app-user/all-users',
					},
				},
			},
			{
				name: 'Get Portal Users',
				value: 'getPortalUsers',
				action: 'Get portal users',
				description: 'Get web users (portal users)',
				routing: {
					request: {
						method: 'GET',
						url: '=/users',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a user',
				description: 'Update user information',
				routing: {
					request: {
						method: 'POST',
						url: '=/place/{{$parameter.placeId}}/user',
					},
				},
			},
			{
				name: 'Update By Phone',
				value: 'updateByPhone',
				action: 'Update user by phone',
				description: 'Update user name and/or cars by phone number',
				routing: {
					request: {
						method: 'POST',
						url: '=/place/{{$parameter.placeId}}/user/{{$parameter.phone}}',
					},
				},
			},
		],
		default: 'find',
	},
	{
		...placeIdSelect,
		displayOptions: {
			show: showOnlyForUsers,
			hide: {
				operation: ['getAll', 'getPortalUsers', 'getImage'],
			},
		},
	},
	...userFindDescription,
	...userAddDescription,
	...userAddManyDescription,
	...userUpdateDescription,
	...userUpdateByPhoneDescription,
	...userDeleteDescription,
	...userGetAllDescription,
	...userGetPortalUsersDescription,
	...userGetImageDescription,
];

