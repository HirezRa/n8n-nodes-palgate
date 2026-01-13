import type { INodeProperties } from 'n8n-workflow';
import { phoneSelect } from '../../shared/descriptions';

const showOnlyForUserDelete = {
	operation: ['delete'],
	resource: ['user'],
};

export const userDeleteDescription: INodeProperties[] = [
	// placeIdSelect is defined in index.ts to avoid duplication
	{
		...phoneSelect,
		typeOptions: {
			multipleValues: true,
		},
		default: [],
		required: true,
		displayOptions: { show: showOnlyForUserDelete },
		routing: {
			send: {
				type: 'body',
				property: 'phones',
				// CRITICAL SAFETY: Prevent empty arrays that would delete ALL users
				// This expression:
				// 1. Converts single string to array
				// 2. Filters out empty/null/undefined values
				// 3. Throws error if result is empty (prevents mass deletion)
				value: '={{(() => { const val = Array.isArray($value) ? $value : ($value ? [$value] : []); const filtered = val.filter(v => v && String(v).trim() !== ""); if (filtered.length === 0) { throw new Error("CRITICAL: Phone number is required. Empty phone list would delete ALL users. Please provide at least one phone number."); } return filtered; })()}}',
			},
		},
	},
];
