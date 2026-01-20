import { apiClient } from './client';
import { GalleryRequestDto, GalleryResponseDto, Page } from '@/types';

export const galleryApi = {
  // 갤러리 목록 조회
  getGalleries: async (params?: {
    page?: number;
    size?: number;
    category?: string;
  }): Promise<Page<GalleryResponseDto>> => {
    const response = await apiClient.get<Page<GalleryResponseDto>>('/api/gallery', { params });
    return response.data;
  },

  // 갤러리 상세 조회
  getGallery: async (id: number): Promise<GalleryResponseDto> => {
    const response = await apiClient.get<GalleryResponseDto>(`/api/gallery/${id}`);
    return response.data;
  },

  // 최근 갤러리 조회
  getRecentGalleries: async (): Promise<GalleryResponseDto[]> => {
    const response = await apiClient.get<GalleryResponseDto[]>('/api/gallery/recent');
    return response.data;
  },

  // 갤러리 생성
  createGallery: async (data: GalleryRequestDto, image: File): Promise<GalleryResponseDto> => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.photographer) {
      formData.append('photographer', data.photographer);
    }
    if (data.category) {
      formData.append('category', data.category);
    }
    formData.append('image', image);

    const response = await apiClient.post<GalleryResponseDto>('/api/gallery', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 갤러리 수정
  updateGallery: async (
    id: number,
    data: GalleryRequestDto,
    image?: File
  ): Promise<GalleryResponseDto> => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.photographer) {
      formData.append('photographer', data.photographer);
    }
    if (data.category) {
      formData.append('category', data.category);
    }
    if (image) {
      formData.append('image', image);
    }

    const response = await apiClient.put<GalleryResponseDto>(`/api/gallery/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 갤러리 삭제
  deleteGallery: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/gallery/${id}`);
  },

  // 갤러리 검색
  searchGalleries: async (params: {
    keyword: string;
    page?: number;
    size?: number;
    category?: string;
  }): Promise<Page<GalleryResponseDto>> => {
    const response = await apiClient.get<Page<GalleryResponseDto>>('/api/gallery/search', {
      params,
    });
    return response.data;
  },
};
