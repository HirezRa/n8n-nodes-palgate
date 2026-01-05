import type { INodeProperties } from 'n8n-workflow';
import { placeIdSelect } from '../../shared/descriptions';

const showOnlyForCarSearchInLogs = {
	operation: ['searchInLogs'],
	resource: ['car'],
};

export const carSearchInLogsDescription: INodeProperties[] = [
	{
		...placeIdSelect,
		displayOptions: { show: showOnlyForCarSearchInLogs },
	},
	{
		displayName: 'Car Number',
		name: 'carNumber',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: showOnlyForCarSearchInLogs },
		description: 'Car number to search in logs',
	},
];
