import { requests } from './utils';



export const ConfigAPI = {
	get: (): Promise<any> => requests.get('config/'),
	set: (config: any): Promise<any> => requests.post('config/a/set', config),
};