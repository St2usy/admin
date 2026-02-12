import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiError } from '@/types';

/**
 * API 베이스 URL 결정
 * - 브라우저 + 동일 오리진: 상대 경로 사용 (빌드 시점 BASE_URL 의존성 제거)
 * - 로컬 개발(다른 포트): VITE_API_BASE_URL 사용 (예: admin 5173, api 8080)
 */
function getApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  if (typeof window !== 'undefined') {
    try {
      const envOrigin = new URL(env).origin;
      if (envOrigin === window.location.origin) {
        return '';
      }
    } catch {
      /* ignore */
    }
    return env;
  }
  return env;
}

// Axios 인스턴스 생성
export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      // 로그인/로그아웃 API 호출 시에는 리다이렉트하지 않음 (컴포넌트에서 처리)
      const isAuthEndpoint = requestUrl.includes('/api/auth/login') || requestUrl.includes('/api/auth/logout');
      
      if (!isAuthEndpoint) {
        // 인증 실패 시 로그인 페이지로 리다이렉트 (로그인/로그아웃 제외)
        localStorage.removeItem('auth_token');
        // React Router를 사용하므로 window.location.href 대신 이벤트를 발생시켜 처리
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

// 에러 메시지 추출 헬퍼 함수
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // 서버에 도달하지 못한 경우 (연결 거부, CORS, 타임아웃 등)
    if (!error.response) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return '서버에 연결할 수 없습니다. 백엔드 주소(VITE_API_BASE_URL)와 실행 여부를 확인하세요.';
      }
      if (error.code === 'ECONNABORTED') {
        return '요청 시간이 초과되었습니다.';
      }
      return error.message || '서버에 연결할 수 없습니다.';
    }
    const apiError = error.response?.data as ApiError;
    if (apiError?.message) {
      return apiError.message;
    }
    if (apiError?.errors && apiError.errors.length > 0) {
      return apiError.errors.map((e) => e.message).join(', ');
    }
    return error.message || '알 수 없는 오류가 발생했습니다.';
  }
  return '알 수 없는 오류가 발생했습니다.';
};
