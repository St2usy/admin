import { apiClient } from './client';
import { MatchingRequestDto, MatchingResponseDto, Page } from '@/types';

export const matchingApi = {
  // 매칭 목록 조회
  getMatchings: async (params?: {
    type?: string;
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<Page<MatchingResponseDto>> => {
    const response = await apiClient.get<Page<MatchingResponseDto>>('/api/matching', { params });
    return response.data;
  },

  // 매칭 상세 조회
  getMatching: async (id: number): Promise<MatchingResponseDto> => {
    const response = await apiClient.get<MatchingResponseDto>(`/api/matching/${id}`);
    return response.data;
  },

  // 매칭 생성
  createMatching: async (data: MatchingRequestDto): Promise<MatchingResponseDto> => {
    const response = await apiClient.post<MatchingResponseDto>('/api/matching', data);
    return response.data;
  },

  // 매칭 수정
  updateMatching: async (id: number, data: MatchingRequestDto): Promise<MatchingResponseDto> => {
    const response = await apiClient.put<MatchingResponseDto>(`/api/matching/${id}`, data);
    return response.data;
  },

  // 매칭 삭제
  deleteMatching: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/matching/${id}`);
  },
};
