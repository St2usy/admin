import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from './constants';

// 파일 유효성 검사
export const validateImageFile = (file: File): string | null => {
  if (!file) {
    return null;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB를 초과할 수 없습니다.`;
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return '지원되는 이미지 형식은 JPEG, PNG, GIF입니다.';
  }

  return null;
};

// 날짜 포맷팅
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
