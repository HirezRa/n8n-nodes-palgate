import type { INodeProperties } from 'n8n-workflow';
import { serialSelect } from '../../shared/descriptions';

const showOnlyForDeviceGetLiveStatusHistory = {
	operation: ['getLiveStatusHistory'],
	resource: ['device'],
};

export const deviceGetLiveStatusHistoryDescription: INodeProperties[] = [
	{
		...serialSelect,
		displayOptions: { show: showOnlyForDeviceGetLiveStatusHistory },
	},
];

