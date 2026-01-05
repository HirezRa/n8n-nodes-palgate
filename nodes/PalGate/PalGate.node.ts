import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { userDescription } from './resources/users';
import { carDescription } from './resources/cars';
import { placeDescription } from './resources/places';
import { deviceDescription } from './resources/devices';
import { organizationDescription } from './resources/organizations';
import { dashboardDescription } from './resources/dashboard';






export class PalGate implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PAL Gate',
		name: 'palGate',
		icon: 'file:icon.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume PAL Portal API',
		defaults: {
			name: 'PAL Gate',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'palGateApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://portal.pal-es.com/api1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Car',
						value: 'car',
					},
					{
						name: 'Dashboard',
						value: 'dashboard',
					},
					{
						name: 'Device',
						value: 'device',
					},
					{
						name: 'Organization',
						value: 'organization',
					},
					{
						name: 'Place',
						value: 'place',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'user',
			},
			...userDescription,
			...carDescription,
			...placeDescription,
			...deviceDescription,
			...organizationDescription,
			...dashboardDescription,
		],
	};
}

