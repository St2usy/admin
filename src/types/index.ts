// 공지사항 관련 타입
export interface NoticeRequestDto {
  title: string;
  content: string;
  author: string;
  isPinned?: boolean;
  category?: string;
}

export interface NoticeResponseDto {
  id: number;
  title: string;
  content: string;
  author: string;
  isPinned: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  category: string | null;
  imageUrl: string | null;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
}

// 인증 관련 타입
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}

// 갤러리 관련 타입
export interface GalleryRequestDto {
  title: string;
  description?: string;
  photographer?: string;
  category?: string;
}

export interface GalleryResponseDto {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  photographer: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  category: string | null;
}

// API 에러 응답 타입
export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
