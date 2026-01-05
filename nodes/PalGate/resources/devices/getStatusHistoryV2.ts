import type { INodeProperties } from 'n8n-workflow';
import { serialSelect } from '../../shared/descriptions';

const showOnlyForDeviceGetStatusHistoryV2 = {
	operation: ['getStatusHistoryV2'],
	resource: ['device'],
};

export const deviceGetStatusHistoryV2Description: INodeProperties[] = [
	{
		...serialSelect,
		displayOptions: { show: showOnlyForDeviceGetStatusHistoryV2 },
	},
];

