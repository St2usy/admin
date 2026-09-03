import { apiClient } from './client';

export interface PledgeProgressResponse {
  progress: Record<string, boolean>;
}

export const pledgeApi = {
  /** 공약 ID별 이행 여부 조회 */
  getProgress: async (): Promise<PledgeProgressResponse> => {
    const { data } = await apiClient.get<PledgeProgressResponse>('/api/pledges/progress');
    return data;
  },

  /** 단건 이행 여부 수정 (ID로 매칭) */
  updateProgress: async (id: string, completed: boolean): Promise<PledgeProgressResponse> => {
    const { data } = await apiClient.patch<PledgeProgressResponse>(`/api/pledges/progress/${encodeURIComponent(id)}`, { completed });
    return data;
  },

  /** 일괄 이행 여부 수정 */
  updateProgressBatch: async (progress: Record<string, boolean>): Promise<PledgeProgressResponse> => {
    const { data } = await apiClient.patch<PledgeProgressResponse>('/api/pledges/progress', { progress });
    return data;
  },
};
