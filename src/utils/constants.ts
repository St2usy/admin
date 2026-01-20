// 공지사항 카테고리
export const NOTICE_CATEGORIES = [
  '학과소식',
  '일반공지',
  '학사공지',
  '사업단공지',
  '취업정보',
] as const;

export type NoticeCategory = typeof NOTICE_CATEGORIES[number];

// 파일 업로드 제한
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

// 페이지 크기 기본값
export const DEFAULT_PAGE_SIZE = 10;
