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

// 매칭 관련 타입
export interface MatchingRequestDto {
  title: string;
  type: string;
  category?: string;
  description?: string;
  maxMembers?: number;
  currentMembers?: number;
  deadline?: string;
  thumbnail?: string;
  organizerId?: number;
  organizerName?: string;
  companyType?: string;
  targetAudience?: string;
  applicationStart?: string;
  applicationEnd?: string;
  activityPeriod?: string;
  recruitCount?: string;
  activityArea?: string;
  homepage?: string;
  tagsActivity?: string[];
}

export interface MatchingResponseDto {
  id: number;
  title: string;
  type: string;
  category: string | null;
  description: string | null;
  members: string | null;
  deadline: string | null;
  dDay: number | null;
  views: number;
  comments: number;
  thumbnail: string | null;
  organizerId: number | null;
  organizerName: string | null;
  companyType: string | null;
  targetAudience: string | null;
  applicationStart: string | null;
  applicationEnd: string | null;
  activityPeriod: string | null;
  recruitCount: string | null;
  activityArea: string | null;
  homepage: string | null;
  tagsActivity: string[];
}

// API 에러 응답 타입
export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
