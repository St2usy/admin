import { apiClient } from './client';

export interface ResourceFileResponse {
  id: number;
  category: string;
  originalFileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  title: string | null;
  description: string | null;
  createdAt: string;
}

export interface FinanceReportResponse {
  id: number;
  title: string;
  description: string | null;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  year: number;
  month: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceReportRequest {
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  year: number;
  month: number;
}

export interface FinanceUploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

export interface ResourceStats {
  inspection: number;
  finance: number;
  gallery: number;
  'study-support': number;
}

export type ResourceCategory = 'inspection' | 'finance' | 'gallery' | 'study-support';

export const CATEGORY_INFO: Record<ResourceCategory, { label: string; accept: string; description: string }> = {
  'inspection': {
    label: '시설 점검 결과',
    accept: 'image/*',
    description: '시설 점검 결과 이미지를 업로드합니다.',
  },
  'finance': {
    label: '회계내역 공개',
    accept: 'application/pdf',
    description: '회계내역 PDF 파일을 업로드합니다.',
  },
  'gallery': {
    label: '갤러리',
    accept: 'image/*',
    description: '갤러리 이미지를 업로드합니다.',
  },
  'study-support': {
    label: '심과함께',
    accept: 'image/*',
    description: '심과함께 관련 이미지를 업로드합니다.',
  },
};

export const resourcesApi = {
  // 파일 업로드
  uploadFile: async (
    category: ResourceCategory,
    file: File,
    title?: string,
    description?: string
  ): Promise<ResourceFileResponse> => {
    const formData = new FormData();
    formData.append('category', category);
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);

    const response = await apiClient.post<ResourceFileResponse>('/api/resources/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 여러 파일 업로드
  uploadMultipleFiles: async (
    category: ResourceCategory,
    files: File[],
    title?: string,
    description?: string
  ): Promise<ResourceFileResponse[]> => {
    const formData = new FormData();
    formData.append('category', category);
    files.forEach((file) => formData.append('files', file));
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);

    const response = await apiClient.post<ResourceFileResponse[]>('/api/resources/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 카테고리별 파일 목록 조회 (페이징)
  getFilesByCategory: async (
    category: ResourceCategory,
    page: number = 0,
    size: number = 20
  ): Promise<{ content: ResourceFileResponse[]; totalPages: number; totalElements: number }> => {
    const response = await apiClient.get(`/api/resources`, {
      params: { category, page, size },
    });
    return response.data;
  },

  // 카테고리별 전체 파일 목록 조회
  getAllFilesByCategory: async (category: ResourceCategory): Promise<ResourceFileResponse[]> => {
    const response = await apiClient.get<ResourceFileResponse[]>(`/api/resources/all`, {
      params: { category },
    });
    return response.data;
  },

  // 특정 파일 조회
  getFileById: async (id: number): Promise<ResourceFileResponse> => {
    const response = await apiClient.get<ResourceFileResponse>(`/api/resources/${id}`);
    return response.data;
  },

  // 파일 삭제
  deleteFile: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/resources/${id}`);
  },

  // 전체 카테고리 통계
  getStats: async (): Promise<ResourceStats> => {
    const response = await apiClient.get<ResourceStats>('/api/resources/stats');
    return response.data;
  },
};

// 회계 보고서 전용 API
export const financeReportApi = {
  // PDF 파일 업로드
  uploadPdf: async (file: File): Promise<FinanceUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<FinanceUploadResponse>('/api/finance/reports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 회계 보고서 등록
  createReport: async (data: FinanceReportRequest): Promise<FinanceReportResponse> => {
    const response = await apiClient.post<FinanceReportResponse>('/api/finance/reports', data);
    return response.data;
  },

  // 회계 보고서 목록 조회
  getReports: async (params?: {
    page?: number;
    size?: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: string;
    year?: number;
  }): Promise<{ content: FinanceReportResponse[]; totalPages: number; totalElements: number }> => {
    const response = await apiClient.get('/api/finance/reports', { params });
    return response.data;
  },

  // 회계 보고서 삭제
  deleteReport: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/finance/reports/${id}`);
  },
};
