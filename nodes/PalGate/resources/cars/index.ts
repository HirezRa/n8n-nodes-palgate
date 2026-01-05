import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect } from '../../shared/descriptions';
import { carAddDescription } from './add';
import { carDeleteDescription } from './delete';
import { carDeleteByIdDescription } from './deleteById';
import { carSearchInLogsDescription } from './searchInLogs';

const showOnlyForCars = {
	resource: ['car'],
};

export const carDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForCars,
		},
		options: [
			{
				name: 'Add',
				value: 'add',
				action: 'Add a car',
				description: 'Add a car to a user',
				routing: {
					request: {
						method: 'POST',
						url: '=/place/{{$parameter.placeId}}/cars',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a car',
				description: 'Delete a car from a user (POST method)',
				routing: {
					request: {
						method: 'POST',
						url: '=/place/{{$parameter.placeId}}/delete-car',
						qs: {
							carId: '={{$parameter.carId}}',
							userId: '={{$parameter.phone}}',
						},
					},
				},
			},
			{
				name: 'Delete By ID',
				value: 'deleteById',
				action: 'Delete a car by ID',
				description: 'Delete a car from a user using DELETE method',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/place/{{$parameter.placeId}}/user/{{$parameter.phone}}/car/{{$parameter.carId}}',
					},
				},
			},
			{
				name: 'Search In Logs',
				value: 'searchInLogs',
				action: 'Search car in logs',
				description: 'Search for a car in logs',
				routing: {
					request: {
						method: 'GET',
						url: '=/place/{{$parameter.placeId}}/reports/car',
						qs: {
							carId: '={{$parameter.carNumber}}',
						},
					},
				},
			},
		],
		default: 'add',
	},
	{
		...placeIdSelect,
		displayOptions: {
			show: showOnlyForCars,
		},
	},
	...carAddDescription,
	...carDeleteDescription,
	...carDeleteByIdDescription,
	...carSearchInLogsDescription,
];
