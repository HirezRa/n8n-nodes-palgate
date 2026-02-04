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
		description: 'Phone number(s) to delete. Uses correct API format: POST /place/{placeId}/delete-many-users with userList array.',
		routing: {
			send: {
				type: 'body',
				property: 'userList',
				// CRITICAL SAFETY: Prevent empty arrays that would delete ALL users
				// Convert value to array and format phone numbers
				// CORRECT API FORMAT: { "userList": ["phoneNumber"] }
				// Phone numbers MUST be in format: 972XXXXXXXXX (Israel country code + number)
				// Handles: string, number, array of strings/numbers
				// Note: multipleValues: true should handle array conversion, but we ensure it here
				value: '={{(() => { const val = $value; if (val === null || val === undefined || val === "") { throw new Error("CRITICAL SAFETY: Phone number is required. Empty userList would delete ALL users."); } const arr = Array.isArray(val) ? val : [val]; if (arr.length === 0) { throw new Error("CRITICAL SAFETY: Phone number is required. Empty userList would delete ALL users."); } return arr.map(phone => { if (phone === null || phone === undefined || phone === "") { return null; } let clean = String(phone).trim().replace(/[\\s\\-\\(\\)]/g, ""); if (clean.startsWith("0")) { clean = "972" + clean.substring(1); } if (!clean.startsWith("972") && !clean.startsWith("+972")) { clean = "972" + clean; } clean = clean.replace("+", ""); return clean; }).filter(v => v !== null); })()}}',
			},
		},
	},
];
