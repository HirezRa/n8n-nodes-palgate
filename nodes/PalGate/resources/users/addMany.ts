import type { INodeProperties } from 'n8n-workflow';

const showOnlyForUserAddMany = {
	operation: ['addMany'],
	resource: ['user'],
};

export const userAddManyDescription: INodeProperties[] = [
	// placeIdSelect is defined in index.ts to avoid duplication
	{
		displayName: 'Users',
		name: 'users',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add User',
		},
		default: {},
		required: true,
		displayOptions: { show: showOnlyForUserAddMany },
		description: 'List of users to add',
		options: [
			{
				displayName: 'User',
				name: 'user',
				values: [
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
						required: true,
						description: 'Phone number',
					},
					{
						displayName: 'First Name',
						name: 'first_name',
						type: 'string',
						default: '',
						required: true,
					},
					{
						displayName: 'Last Name',
						name: 'last_name',
						type: 'string',
						default: '',
						required: true,
					},
					{
						displayName: 'Cars',
						name: 'cars',
						type: 'string',
						typeOptions: {
							multipleValues: true,
						},
						default: [],
						description: 'List of car numbers',
					},
				],
			},
		],
		routing: {
			send: {
				type: 'body',
				property: '=',
				value: '={{$value.users.map((u) => ({ id: u.phone, firstname: u.first_name, lastname: u.last_name, cars: u.cars || [] }))}}',
			},
		},
	},
];

