import { apiClient } from './client';
import { NoticeRequestDto, NoticeResponseDto, Page } from '@/types';

export const noticesApi = {
  // 공지사항 목록 조회
  getNotices: async (params?: {
    page?: number;
    size?: number;
    category?: string;
  }): Promise<Page<NoticeResponseDto>> => {
    const response = await apiClient.get<Page<NoticeResponseDto>>('/api/notices', { params });
    return response.data;
  },

  // 공지사항 상세 조회
  getNotice: async (id: number): Promise<NoticeResponseDto> => {
    const response = await apiClient.get<NoticeResponseDto>(`/api/notices/${id}`);
    return response.data;
  },

  // 공지사항 생성
  createNotice: async (data: NoticeRequestDto, image?: File): Promise<NoticeResponseDto> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('author', data.author);
    if (data.isPinned !== undefined) {
      formData.append('isPinned', String(data.isPinned));
    }
    if (data.category) {
      formData.append('category', data.category);
    }
    if (image) {
      formData.append('image', image);
    }

    const response = await apiClient.post<NoticeResponseDto>('/api/notices', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 공지사항 수정
  updateNotice: async (
    id: number,
    data: NoticeRequestDto,
    image?: File
  ): Promise<NoticeResponseDto> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('author', data.author);
    if (data.isPinned !== undefined) {
      formData.append('isPinned', String(data.isPinned));
    }
    if (data.category) {
      formData.append('category', data.category);
    }
    if (image) {
      formData.append('image', image);
    }

    const response = await apiClient.put<NoticeResponseDto>(`/api/notices/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 공지사항 삭제
  deleteNotice: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/notices/${id}`);
  },
};
