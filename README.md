# FeeL 관리자 홈페이지

공지사항 및 갤러리를 관리하기 위한 관리자 대시보드입니다.

## 기술 스택

- **프론트엔드**: React 18 + TypeScript
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS
- **라우팅**: React Router v6
- **HTTP 클라이언트**: Axios
- **폼 관리**: React Hook Form

## 프로젝트 구조

```
src/
├── api/              # API 클라이언트 모듈
│   ├── auth.ts      # 인증 API
│   ├── client.ts    # Axios 설정 및 인터셉터
│   ├── notices.ts   # 공지사항 API
│   └── gallery.ts   # 갤러리 API
├── components/       # 공통 컴포넌트
│   ├── auth/        # 인증 관련 컴포넌트
│   ├── common/      # 공통 UI 컴포넌트
│   └── layout/      # 레이아웃 컴포넌트
├── contexts/         # React Context
│   └── AuthContext.tsx
├── modules/          # 기능별 모듈
│   ├── auth/        # 로그인 모듈
│   ├── notices/     # 공지사항 관리 모듈
│   └── gallery/     # 갤러리 관리 모듈
├── types/            # TypeScript 타입 정의
├── utils/            # 유틸리티 함수
├── App.tsx           # 메인 앱 컴포넌트
└── main.tsx          # 진입점
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

### 3. 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

## 환경 변수

`.env` 파일을 생성하여 다음 변수를 설정할 수 있습니다:

```env
VITE_API_BASE_URL=http://localhost:8080
```

기본값은 `http://localhost:8080`입니다.

## 백엔드 API 연동

이 관리자 홈페이지는 다음 백엔드 API를 사용합니다:

- Base URL: `http://localhost:8080`
- 공지사항 API: `/api/notices`
- 갤러리 API: `/api/gallery`
- 인증 API: `/api/auth` (구현 필요)

### 인증 API 구현 필요

현재 프론트엔드는 다음 인증 API를 기대합니다:

#### POST /api/auth/login
```json
{
  "username": "string",
  "password": "string"
}
```

**응답:**
```json
{
  "token": "string",
  "username": "string"
}
```

#### GET /api/auth/verify
토큰 검증을 위한 엔드포인트 (Authorization 헤더에 Bearer 토큰 필요)

#### POST /api/auth/logout
로그아웃 엔드포인트

### 임시 인증 우회 (개발용)

백엔드에 인증 API가 아직 구현되지 않은 경우, 다음 방법으로 임시 우회할 수 있습니다:

1. `src/api/auth.ts`의 `login` 함수를 수정하여 임시 토큰을 반환하도록 변경
2. `src/api/client.ts`의 인터셉터에서 토큰 검증을 우회하도록 설정

## 주요 기능

### 현재 구현된 기능

- ✅ 로그인/로그아웃
- ✅ 공지사항 관리
  - 목록 조회 (페이징, 카테고리 필터)
  - 생성/수정/삭제
  - 이미지 업로드 및 미리보기
- ✅ 갤러리 관리
  - 목록 조회 (그리드 레이아웃, 페이징, 카테고리 필터)
  - 검색 기능 (제목 검색)
  - 생성/수정/삭제
  - 이미지 업로드 및 미리보기

### 향후 확장 가능한 기능

- 사용자 관리
- 통계 대시보드
- 파일 관리
- 고급 검색 및 필터링

## 모듈화 구조

프로젝트는 확장성을 고려하여 모듈화되어 있습니다:

1. **API 모듈** (`src/api/`): 각 도메인별로 분리된 API 클라이언트
2. **기능 모듈** (`src/modules/`): 독립적인 기능 단위로 구성
3. **공통 컴포넌트** (`src/components/common/`): 재사용 가능한 UI 컴포넌트
4. **타입 정의** (`src/types/`): 중앙화된 타입 정의

새로운 기능을 추가할 때는 이 구조를 따라 모듈을 추가하면 됩니다.

## 개발 가이드

### 새로운 기능 모듈 추가하기

1. `src/modules/` 하위에 새 모듈 디렉토리 생성
2. `src/api/`에 해당 API 클라이언트 추가
3. `src/types/`에 필요한 타입 정의 추가
4. `src/App.tsx`에 라우트 추가

### 공통 컴포넌트 사용하기

공통 컴포넌트는 `src/components/common/`에 정의되어 있으며, 다음과 같이 사용할 수 있습니다:

```tsx
import { Button, Input, Alert } from '@/components/common/Input';
```

## 문제 해결

### CORS 오류

백엔드에서 CORS 설정이 필요합니다. API 명세서에 따르면 다음 Origin이 허용되어야 합니다:
- `http://localhost:3000`

### 이미지 업로드 실패

- 파일 크기가 10MB를 초과하지 않는지 확인
- 지원되는 이미지 형식인지 확인 (JPEG, PNG, GIF)

## 라이선스

이 프로젝트는 FeeL 학생회를 위한 관리자 홈페이지입니다.
