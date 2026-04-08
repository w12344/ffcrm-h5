import { http as request } from '@/utils/request';

export interface GlobalKPIData {
  revenue: number;
  target: number;
  pending: number;
  refund: number;
  refundHeadcount: number;
}

export const fetchGlobalKPI = () => {
  return request.get<{code: number; data: GlobalKPIData}>('/api/v1/global-kpi');
};

export const fetchNextWeekForecast = () => {
  return request.get<any>('/api/v1/forecast/next-week');
};

export const createInterviewAction = (data: any) => {
  return request.post<any>('/api/v1/action/create-interview', data);
};

export const exportManagementActions = () => {
  return request.get<Blob>('/api/v1/export/management-actions', { responseType: 'blob' });
};
