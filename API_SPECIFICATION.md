# FeeL Backend API 명세서

> 관리자 홈페이지 프로젝트 제작을 위한 API 명세서

## 목차

1. [API 개요](#api-개요)
2. [기본 정보](#기본-정보)
3. [공지사항 API](#공지사항-api)
4. [갤러리 API](#갤러리-api)
5. [데이터 모델](#데이터-모델)
6. [에러 처리](#에러-처리)
7. [페이징 정보](#페이징-정보)

---

## API 개요

본 API는 전북대학교 공과대학 FeeL 학생회의 공지사항 및 갤러리 관리 시스템을 위한 RESTful API입니다.

### 주요 기능
- 공지사항 관리 (CRUD)
- 갤러리 관리 (CRUD)
- 파일 업로드 (이미지)
- 검색 및 필터링
- 페이징 처리

---

## 기본 정보

### Base URL
```
개발 환경: http://localhost:8080
프로덕션: https://your-domain.com
```

### Content-Type
- JSON 요청: `application/json`
- 파일 업로드: `multipart/form-data`

### CORS 설정
- 허용된 Origin:
  - `http://localhost:3000`
  - `https://m-se0k.github.io`

### 인증
현재 버전에서는 인증이 구현되어 있지 않습니다. (향후 추가 예정)

---

## 공지사항 API

### 1. 공지사항 생성

**엔드포인트**
```
POST /api/notices
```

**요청 형식**
- Content-Type: `multipart/form-data`

**요청 파라미터**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| title | String | ✅ | 제목 (최대 200자) |
| content | String | ✅ | 내용 |
| author | String | ✅ | 작성자 (최대 50자) |
| isPinned | Boolean | ❌ | 고정 여부 (기본값: false) |
| category | String | ❌ | 카테고리 (최대 50자) |
| image | File | ❌ | 이미지 파일 (최대 10MB) |

**유효한 카테고리 값**
- `학과소식`
- `일반공지`
- `학사공지`
- `사업단공지`
- `취업정보`

**요청 예시**
```javascript
const formData = new FormData();
formData.append('title', '새로운 공지사항');
formData.append('content', '공지사항 내용입니다.');
formData.append('author', '관리자');
formData.append('isPinned', 'false');
formData.append('category', '일반공지');
formData.append('image', fileInput.files[0]); // 선택사항

fetch('http://localhost:8080/api/notices', {
  method: 'POST',
  body: formData
});
```

**응답 예시**
```json
{
  "id": 1,
  "title": "새로운 공지사항",
  "content": "공지사항 내용입니다.",
  "author": "관리자",
  "isPinned": false,
  "viewCount": 0,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "category": "일반공지",
  "imageUrl": "/uploads/image-1234567890.jpg"
}
```

**HTTP 상태 코드**
- `201 Created`: 성공
- `400 Bad Request`: 유효성 검증 실패

---

### 2. 공지사항 일괄 생성

**엔드포인트**
```
POST /api/notices/batch
```

**요청 형식**
- Content-Type: `application/json`

**요청 본문**
```json
[
  {
    "title": "첫 번째 공지사항",
    "content": "내용 1",
    "author": "관리자1",
    "isPinned": false,
    "category": "일반공지"
  },
  {
    "title": "두 번째 공지사항",
    "content": "내용 2",
    "author": "관리자2",
    "isPinned": true,
    "category": "학사공지"
  }
]
```

**응답 예시**
```json
[
  {
    "id": 1,
    "title": "첫 번째 공지사항",
    "content": "내용 1",
    "author": "관리자1",
    "isPinned": false,
    "viewCount": 0,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00",
    "category": "일반공지",
    "imageUrl": null
  },
  {
    "id": 2,
    "title": "두 번째 공지사항",
    "content": "내용 2",
    "author": "관리자2",
    "isPinned": true,
    "viewCount": 0,
    "createdAt": "2024-01-15T10:30:01",
    "updatedAt": "2024-01-15T10:30:01",
    "category": "학사공지",
    "imageUrl": null
  }
]
```

**참고사항**
- 일괄 생성 시 이미지 업로드는 지원하지 않습니다.
- 모든 항목이 성공적으로 생성되거나 모두 실패합니다 (트랜잭션 처리).

---

### 3. 전체 공지사항 조회

**엔드포인트**
```
GET /api/notices
```

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| page | Integer | ❌ | 0 | 페이지 번호 (0부터 시작) |
| size | Integer | ❌ | 10 | 페이지 크기 |
| category | String | ❌ | - | 카테고리 필터 |

**요청 예시**
```javascript
// 전체 조회
fetch('http://localhost:8080/api/notices?page=0&size=10')

// 카테고리 필터링
fetch('http://localhost:8080/api/notices?page=0&size=10&category=일반공지')
```

**응답 예시**
```json
{
  "content": [
    {
      "id": 1,
      "title": "공지사항 제목",
      "content": "내용",
      "author": "관리자",
      "isPinned": true,
      "viewCount": 100,
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00",
      "category": "일반공지",
      "imageUrl": "/uploads/image.jpg"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    }
  },
  "totalElements": 25,
  "totalPages": 3,
  "last": false,
  "first": true,
  "size": 10,
  "number": 0,
  "numberOfElements": 10,
  "empty": false,
  "sort": {
    "sorted": true,
    "unsorted": false,
    "empty": false
  }
}
```

**정렬**
- 기본 정렬: `createdAt` 기준 내림차순 (최신순)

---

### 4. 고정 공지사항 조회

**엔드포인트**
```
GET /api/notices/pinned
```

**응답 예시**
```json
[
  {
    "id": 1,
    "title": "고정 공지사항",
    "content": "내용",
    "author": "관리자",
    "isPinned": true,
    "viewCount": 50,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00",
    "category": "일반공지",
    "imageUrl": null
  }
]
```

**정렬**
- `createdAt` 기준 내림차순 (최신순)

---

### 5. 특정 공지사항 조회

**엔드포인트**
```
GET /api/notices/{id}
```

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | Long | 공지사항 ID |

**요청 예시**
```javascript
fetch('http://localhost:8080/api/notices/1')
```

**응답 예시**
```json
{
  "id": 1,
  "title": "공지사항 제목",
  "content": "내용",
  "author": "관리자",
  "isPinned": false,
  "viewCount": 1,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "category": "일반공지",
  "imageUrl": "/uploads/image.jpg"
}
```

**주의사항**
- 조회 시 `viewCount`가 자동으로 증가합니다.

**에러 응답**
- `404 Not Found`: 존재하지 않는 ID인 경우

---

### 6. 공지사항 수정

**엔드포인트**
```
PUT /api/notices/{id}
```

**요청 형식**
- Content-Type: `multipart/form-data`

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | Long | 공지사항 ID |

**요청 파라미터**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| title | String | ✅ | 제목 (최대 200자) |
| content | String | ✅ | 내용 |
| author | String | ✅ | 작성자 (최대 50자) |
| isPinned | Boolean | ❌ | 고정 여부 |
| category | String | ❌ | 카테고리 (최대 50자) |
| image | File | ❌ | 새 이미지 파일 (최대 10MB) |

**요청 예시**
```javascript
const formData = new FormData();
formData.append('title', '수정된 제목');
formData.append('content', '수정된 내용');
formData.append('author', '관리자');
formData.append('isPinned', 'true');
formData.append('category', '학사공지');
formData.append('image', fileInput.files[0]); // 선택사항 (새 이미지로 교체)

fetch('http://localhost:8080/api/notices/1', {
  method: 'PUT',
  body: formData
});
```

**응답 예시**
```json
{
  "id": 1,
  "title": "수정된 제목",
  "content": "수정된 내용",
  "author": "관리자",
  "isPinned": true,
  "viewCount": 10,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T11:00:00",
  "category": "학사공지",
  "imageUrl": "/uploads/new-image.jpg"
}
```

**주의사항**
- 새 이미지를 업로드하면 기존 이미지 파일이 자동으로 삭제됩니다.
- 이미지를 업로드하지 않으면 기존 이미지가 유지됩니다.

**에러 응답**
- `404 Not Found`: 존재하지 않는 ID인 경우
- `400 Bad Request`: 유효성 검증 실패

---

### 7. 공지사항 삭제

**엔드포인트**
```
DELETE /api/notices/{id}
```

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | Long | 공지사항 ID |

**요청 예시**
```javascript
fetch('http://localhost:8080/api/notices/1', {
  method: 'DELETE'
});
```

**응답**
- `204 No Content`: 성공 (응답 본문 없음)

**주의사항**
- 삭제 시 관련 이미지 파일도 함께 삭제됩니다.

**에러 응답**
- `404 Not Found`: 존재하지 않는 ID인 경우

---

### 8. 카테고리별 공지사항 조회

**엔드포인트**
```
GET /api/notices/category/{category}
```

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| category | String | 카테고리명 |

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| page | Integer | ❌ | 0 | 페이지 번호 |
| size | Integer | ❌ | 10 | 페이지 크기 |

**요청 예시**
```javascript
fetch('http://localhost:8080/api/notices/category/일반공지?page=0&size=10')
```

**응답 형식**
- [전체 공지사항 조회](#3-전체-공지사항-조회)와 동일한 페이징 응답 형식

---

### 9. 공지사항 검색

**엔드포인트**
```
GET /api/notices/search
```

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| keyword | String | ✅ | - | 검색어 (제목 또는 내용) |
| page | Integer | ❌ | 0 | 페이지 번호 |
| size | Integer | ❌ | 10 | 페이지 크기 |
| category | String | ❌ | - | 카테고리 필터 |

**요청 예시**
```javascript
// 전체 검색
fetch('http://localhost:8080/api/notices/search?keyword=테스트&page=0&size=10')

// 카테고리 필터링 검색
fetch('http://localhost:8080/api/notices/search?keyword=테스트&page=0&size=10&category=일반공지')
```

**응답 형식**
- [전체 공지사항 조회](#3-전체-공지사항-조회)와 동일한 페이징 응답 형식

**검색 범위**
- 제목과 내용에서 검색합니다.
- 대소문자 구분 없이 부분 일치 검색을 수행합니다.

---

## 갤러리 API

### 1. 갤러리 생성

**엔드포인트**
```
POST /api/gallery
```

**요청 형식**
- Content-Type: `multipart/form-data`

**요청 파라미터**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| title | String | ✅ | 제목 (최대 200자) |
| description | String | ❌ | 설명 (최대 1000자) |
| photographer | String | ❌ | 촬영자 (최대 50자) |
| category | String | ❌ | 카테고리 (최대 50자) |
| image | File | ✅ | 이미지 파일 (최대 10MB) |

**요청 예시**
```javascript
const formData = new FormData();
formData.append('title', '갤러리 제목');
formData.append('description', '갤러리 설명');
formData.append('photographer', '사진작가');
formData.append('category', '행사');
formData.append('image', fileInput.files[0]); // 필수

fetch('http://localhost:8080/api/gallery', {
  method: 'POST',
  body: formData
});
```

**응답 예시**
```json
{
  "id": 1,
  "title": "갤러리 제목",
  "description": "갤러리 설명",
  "imageUrl": "/uploads/gallery-1234567890.jpg",
  "photographer": "사진작가",
  "viewCount": 0,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "category": "행사"
}
```

**HTTP 상태 코드**
- `201 Created`: 성공
- `400 Bad Request`: 유효성 검증 실패 또는 이미지 파일 누락

**에러 응답 예시**
```json
{
  "message": "이미지 파일은 필수입니다."
}
```

---

### 2. 전체 갤러리 조회

**엔드포인트**
```
GET /api/gallery
```

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| page | Integer | ❌ | 0 | 페이지 번호 (0부터 시작) |
| size | Integer | ❌ | 12 | 페이지 크기 |
| category | String | ❌ | - | 카테고리 필터 |

**요청 예시**
```javascript
// 전체 조회
fetch('http://localhost:8080/api/gallery?page=0&size=12')

// 카테고리 필터링
fetch('http://localhost:8080/api/gallery?page=0&size=12&category=행사')
```

**응답 형식**
- [공지사항 전체 조회](#3-전체-공지사항-조회)와 동일한 페이징 응답 형식
- `content` 배열의 각 항목은 `GalleryResponseDto` 형식

**정렬**
- 기본 정렬: `createdAt` 기준 내림차순 (최신순)

---

### 3. 최근 갤러리 조회

**엔드포인트**
```
GET /api/gallery/recent
```

**응답 예시**
```json
[
  {
    "id": 10,
    "title": "최근 갤러리",
    "description": "설명",
    "imageUrl": "/uploads/image.jpg",
    "photographer": "작가",
    "viewCount": 5,
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00",
    "category": "행사"
  },
  {
    "id": 9,
    "title": "두 번째 갤러리",
    "description": "설명",
    "imageUrl": "/uploads/image2.jpg",
    "photographer": "작가2",
    "viewCount": 3,
    "createdAt": "2024-01-15T09:30:00",
    "updatedAt": "2024-01-15T09:30:00",
    "category": "전시"
  }
]
```

**제한사항**
- 최대 10개까지만 반환됩니다.
- `createdAt` 기준 내림차순 정렬

---

### 4. 특정 갤러리 조회

**엔드포인트**
```
GET /api/gallery/{id}
```

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | Long | 갤러리 ID |

**요청 예시**
```javascript
fetch('http://localhost:8080/api/gallery/1')
```

**응답 예시**
```json
{
  "id": 1,
  "title": "갤러리 제목",
  "description": "갤러리 설명",
  "imageUrl": "/uploads/gallery-image.jpg",
  "photographer": "사진작가",
  "viewCount": 1,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "category": "행사"
}
```

**주의사항**
- 조회 시 `viewCount`가 자동으로 증가합니다.

**에러 응답**
- `404 Not Found`: 존재하지 않는 ID인 경우

---

### 5. 갤러리 수정

**엔드포인트**
```
PUT /api/gallery/{id}
```

**요청 형식**
- Content-Type: `multipart/form-data`

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | Long | 갤러리 ID |

**요청 파라미터**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| title | String | ✅ | 제목 (최대 200자) |
| description | String | ❌ | 설명 (최대 1000자) |
| photographer | String | ❌ | 촬영자 (최대 50자) |
| category | String | ❌ | 카테고리 (최대 50자) |
| image | File | ❌ | 새 이미지 파일 (최대 10MB) |

**요청 예시**
```javascript
const formData = new FormData();
formData.append('title', '수정된 갤러리 제목');
formData.append('description', '수정된 설명');
formData.append('photographer', '새 작가');
formData.append('category', '전시');
formData.append('image', fileInput.files[0]); // 선택사항 (새 이미지로 교체)

fetch('http://localhost:8080/api/gallery/1', {
  method: 'PUT',
  body: formData
});
```

**응답 예시**
```json
{
  "id": 1,
  "title": "수정된 갤러리 제목",
  "description": "수정된 설명",
  "imageUrl": "/uploads/new-gallery-image.jpg",
  "photographer": "새 작가",
  "viewCount": 10,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T11:00:00",
  "category": "전시"
}
```

**주의사항**
- 새 이미지를 업로드하면 기존 이미지 파일이 자동으로 삭제됩니다.
- 이미지를 업로드하지 않으면 기존 이미지가 유지됩니다.

**에러 응답**
- `404 Not Found`: 존재하지 않는 ID인 경우
- `400 Bad Request`: 유효성 검증 실패

---

### 6. 갤러리 삭제

**엔드포인트**
```
DELETE /api/gallery/{id}
```

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | Long | 갤러리 ID |

**요청 예시**
```javascript
fetch('http://localhost:8080/api/gallery/1', {
  method: 'DELETE'
});
```

**응답**
- `204 No Content`: 성공 (응답 본문 없음)

**주의사항**
- 삭제 시 관련 이미지 파일도 함께 삭제됩니다.

**에러 응답**
- `404 Not Found`: 존재하지 않는 ID인 경우

---

### 7. 갤러리 검색

**엔드포인트**
```
GET /api/gallery/search
```

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| keyword | String | ✅ | - | 검색어 (제목) |
| page | Integer | ❌ | 0 | 페이지 번호 |
| size | Integer | ❌ | 12 | 페이지 크기 |
| category | String | ❌ | - | 카테고리 필터 |

**요청 예시**
```javascript
// 전체 검색
fetch('http://localhost:8080/api/gallery/search?keyword=행사&page=0&size=12')

// 카테고리 필터링 검색
fetch('http://localhost:8080/api/gallery/search?keyword=행사&page=0&size=12&category=행사')
```

**응답 형식**
- [전체 갤러리 조회](#2-전체-갤러리-조회)와 동일한 페이징 응답 형식

**검색 범위**
- 제목에서만 검색합니다.
- 대소문자 구분 없이 부분 일치 검색을 수행합니다.

---

## 데이터 모델

### NoticeRequestDto

```typescript
interface NoticeRequestDto {
  title: string;        // 필수, 최대 200자
  content: string;      // 필수
  author: string;       // 필수, 최대 50자
  isPinned?: boolean;   // 선택, 기본값: false
  category?: string;    // 선택, 최대 50자
}
```

### NoticeResponseDto

```typescript
interface NoticeResponseDto {
  id: number;
  title: string;
  content: string;
  author: string;
  isPinned: boolean;
  viewCount: number;
  createdAt: string;    // ISO 8601 형식 (예: "2024-01-15T10:30:00")
  updatedAt: string;    // ISO 8601 형식
  category: string | null;
  imageUrl: string | null;  // 예: "/uploads/image.jpg"
}
```

### GalleryRequestDto

```typescript
interface GalleryRequestDto {
  title: string;        // 필수, 최대 200자
  description?: string; // 선택, 최대 1000자
  photographer?: string; // 선택, 최대 50자
  category?: string;    // 선택, 최대 50자
}
```

### GalleryResponseDto

```typescript
interface GalleryResponseDto {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;    // 예: "/uploads/gallery-image.jpg"
  photographer: string | null;
  viewCount: number;
  createdAt: string;    // ISO 8601 형식
  updatedAt: string;    // ISO 8601 형식
  category: string | null;
}
```

### Page<T> (페이징 응답)

```typescript
interface Page<T> {
  content: T[];              // 현재 페이지의 데이터 배열
  pageable: {
    pageNumber: number;      // 현재 페이지 번호 (0부터 시작)
    pageSize: number;        // 페이지 크기
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalElements: number;     // 전체 데이터 개수
  totalPages: number;        // 전체 페이지 수
  last: boolean;             // 마지막 페이지 여부
  first: boolean;            // 첫 페이지 여부
  size: number;             // 페이지 크기
  number: number;           // 현재 페이지 번호
  numberOfElements: number; // 현재 페이지의 데이터 개수
  empty: boolean;           // 빈 페이지 여부
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
}
```

---

## 에러 처리

### HTTP 상태 코드

| 상태 코드 | 설명 |
|----------|------|
| 200 OK | 요청 성공 |
| 201 Created | 리소스 생성 성공 |
| 204 No Content | 요청 성공 (응답 본문 없음) |
| 400 Bad Request | 잘못된 요청 (유효성 검증 실패 등) |
| 404 Not Found | 리소스를 찾을 수 없음 |
| 500 Internal Server Error | 서버 내부 오류 |

### 에러 응답 형식

유효성 검증 실패 시:
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "유효성 검증 실패",
  "errors": [
    {
      "field": "title",
      "message": "제목은 필수입니다."
    },
    {
      "field": "category",
      "message": "유효하지 않은 카테고리입니다: '잘못된카테고리'. 허용된 카테고리: [학과소식, 일반공지, 학사공지, 사업단공지, 취업정보]"
    }
  ]
}
```

리소스를 찾을 수 없는 경우:
```json
{
  "message": "공지사항을 찾을 수 없습니다. ID: 999"
}
```

또는

```json
{
  "message": "갤러리를 찾을 수 없습니다. ID: 999"
}
```

### 유효성 검증 규칙

#### 공지사항 (NoticeRequestDto)
- `title`: 필수, 최대 200자
- `content`: 필수
- `author`: 필수, 최대 50자
- `category`: 선택, 최대 50자, 유효한 값만 허용
- `isPinned`: 선택, Boolean 타입

#### 갤러리 (GalleryRequestDto)
- `title`: 필수, 최대 200자
- `description`: 선택, 최대 1000자
- `photographer`: 선택, 최대 50자
- `category`: 선택, 최대 50자

#### 파일 업로드
- 최대 파일 크기: 10MB
- 지원 형식: 이미지 파일 (jpg, png, gif 등)
- 갤러리 생성 시 이미지는 필수

---

## 페이징 정보

### 기본값
- 공지사항: `page=0`, `size=10`
- 갤러리: `page=0`, `size=12`

### 페이지 번호
- 페이지 번호는 0부터 시작합니다.
- 예: 첫 페이지 = `page=0`, 두 번째 페이지 = `page=1`

### 정렬
- 기본 정렬: `createdAt` 기준 내림차순 (최신순)
- 사용자 지정 정렬은 현재 지원하지 않습니다.

### 페이징 응답 활용 예시

```javascript
// 페이징 정보를 활용한 예시
const response = await fetch('http://localhost:8080/api/notices?page=0&size=10');
const data = await response.json();

console.log(`전체 ${data.totalElements}개의 공지사항 중 ${data.numberOfElements}개 표시`);
console.log(`현재 페이지: ${data.number + 1} / ${data.totalPages}`);

// 다음 페이지로 이동
if (!data.last) {
  const nextPage = data.number + 1;
  const nextResponse = await fetch(`http://localhost:8080/api/notices?page=${nextPage}&size=10`);
}
```

---

## 이미지 URL 처리

### 이미지 URL 형식
- 저장된 이미지의 URL은 `/uploads/{filename}` 형식입니다.
- 예: `/uploads/image-1234567890.jpg`

### 이미지 접근
- 개발 환경: `http://localhost:8080/uploads/{filename}`
- 프로덕션: `https://your-domain.com/uploads/{filename}`

### 이미지 표시 예시

```javascript
// React 예시
<img 
  src={`http://localhost:8080${notice.imageUrl}`} 
  alt={notice.title}
/>

// 또는 절대 URL 사용
const imageUrl = notice.imageUrl 
  ? `http://localhost:8080${notice.imageUrl}` 
  : '/default-image.jpg';
```

---

## 관리자 홈페이지 구현 가이드

### 권장 기능

1. **공지사항 관리 페이지**
   - 목록 조회 (페이징, 카테고리 필터)
   - 생성/수정/삭제
   - 검색 기능
   - 고정 공지사항 관리

2. **갤러리 관리 페이지**
   - 목록 조회 (페이징, 카테고리 필터)
   - 생성/수정/삭제
   - 검색 기능
   - 이미지 미리보기

3. **공통 기능**
   - 파일 업로드 (드래그 앤 드롭 지원 권장)
   - 이미지 미리보기
   - 폼 유효성 검증
   - 에러 처리 및 사용자 피드백

### 구현 시 주의사항

1. **파일 업로드**
   - `multipart/form-data` 형식 사용
   - 파일 크기 제한 (10MB) 확인
   - 업로드 진행 상태 표시 권장

2. **페이징 처리**
   - 페이지 번호는 0부터 시작
   - `totalPages`, `last`, `first` 속성 활용

3. **에러 처리**
   - 네트워크 오류 처리
   - 유효성 검증 오류 표시
   - 404 오류 처리

4. **이미지 표시**
   - `imageUrl`이 `null`인 경우 기본 이미지 표시
   - 이미지 로딩 실패 시 에러 처리

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0.0 | 2024-01-15 | 초기 API 명세서 작성 |

---

## 문의 및 지원

API 관련 문의사항이 있으시면 개발팀에 연락해주세요.
