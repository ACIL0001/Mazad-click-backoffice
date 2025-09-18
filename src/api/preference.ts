import Preference from '../types/Preference';
import { requests } from './utils';



export const PreferenceAPI = {
	get: () => requests.get(`preference`),
	update: (preference: Preference): Promise<any> => requests.post('preference/update', preference),
	reset: (): Promise<any> => requests.get('preference/reset'),
};

