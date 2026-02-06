import { apiClient } from './client';
import { ActivityPostRequestDto, ActivityPostResponseDto, Page } from '@/types';

const BASE = '/api/activities';

export const activitiesApi = {
  getList: async (params?: {
    category?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<Page<ActivityPostResponseDto>> => {
    const response = await apiClient.get<Page<ActivityPostResponseDto>>(BASE, { params });
    return response.data;
  },

  getById: async (id: number): Promise<ActivityPostResponseDto> => {
    const response = await apiClient.get<ActivityPostResponseDto>(`${BASE}/${id}`);
    return response.data;
  },

  create: async (data: ActivityPostRequestDto, thumbnail?: File): Promise<ActivityPostResponseDto> => {
    const formData = new FormData();
    formData.append('category', data.category);
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('author', data.author);
    if (data.thumbnailUrl) formData.append('thumbnailUrl', data.thumbnailUrl);
    if (data.organization) formData.append('organization', data.organization);
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    if (data.applyUrl) formData.append('applyUrl', data.applyUrl);
    if (data.recruitmentRoles) formData.append('recruitmentRoles', data.recruitmentRoles);
    if (data.contactUrl) formData.append('contactUrl', data.contactUrl);
    if (data.status) formData.append('status', data.status);
    if (thumbnail) formData.append('thumbnail', thumbnail);

    const response = await apiClient.post<ActivityPostResponseDto>(BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (
    id: number,
    data: ActivityPostRequestDto,
    thumbnail?: File
  ): Promise<ActivityPostResponseDto> => {
    const formData = new FormData();
    formData.append('category', data.category);
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('author', data.author);
    if (data.thumbnailUrl !== undefined) formData.append('thumbnailUrl', data.thumbnailUrl ?? '');
    if (data.organization !== undefined) formData.append('organization', data.organization ?? '');
    if (data.startDate !== undefined) formData.append('startDate', data.startDate ?? '');
    if (data.endDate !== undefined) formData.append('endDate', data.endDate ?? '');
    if (data.applyUrl !== undefined) formData.append('applyUrl', data.applyUrl ?? '');
    if (data.recruitmentRoles !== undefined) formData.append('recruitmentRoles', data.recruitmentRoles ?? '');
    if (data.contactUrl !== undefined) formData.append('contactUrl', data.contactUrl ?? '');
    if (data.status !== undefined) formData.append('status', data.status ?? '');
    if (thumbnail) formData.append('thumbnail', thumbnail);

    const response = await apiClient.put<ActivityPostResponseDto>(`${BASE}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
