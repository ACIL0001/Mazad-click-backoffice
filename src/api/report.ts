import Report from '../types/Report';
import { requests } from './utils';



export const ReportAPI = {
	get: () => requests.get(`report/r`),
	report: (report: Report): Promise<any> => requests.post('report/user', report),
	close: (id: string): Promise<any> => requests.get(`report/r/close/${id}`),
};

