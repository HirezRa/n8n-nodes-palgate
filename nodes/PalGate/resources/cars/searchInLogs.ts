import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCarSearchInLogs = {
	operation: ['searchInLogs'],
	resource: ['car'],
};

export const carSearchInLogsDescription: INodeProperties[] = [
	// placeIdSelect is defined in index.ts to avoid duplication
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
