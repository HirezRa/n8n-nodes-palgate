import type { INodeProperties } from 'n8n-workflow';
import { serialSelect } from '../../shared/descriptions';

const showOnlyForDeviceGetDetails = {
	operation: ['getDetails'],
	resource: ['device'],
};

export const deviceGetDetailsDescription: INodeProperties[] = [
	{
		...serialSelect,
		displayOptions: { show: showOnlyForDeviceGetDetails },
	},
];

