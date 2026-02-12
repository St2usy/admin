# 캘린더(행사 일정) API 명세서

관리자 페이지에서 캘린더 데이터를 관리하기 위한 API 명세서입니다.

## 기본 정보

- **Base URL**: `http://localhost:8080` (개발 환경) 또는 배포 환경 URL
- **Content-Type**: `application/json`
- **인증**: 현재는 인증 없음 (관리자 페이지이므로 추후 JWT 인증 추가 예정)

## API 엔드포인트 목록

### 1. 전체 행사 일정 조회

**엔드포인트**: `GET /api/calendar/events/all`

**설명**: 페이지네이션 없이 모든 행사 일정을 반환합니다. (캐시 가능)

**요청 헤더**:
```
Content-Type: application/json
```

**응답 형식**: 배열

**성공 응답** (200 OK):
```json
[
  {
    "id": 1,
    "date_start": "2024-12-02",
    "date_end": "2024-12-13",
    "event_korean": "대여사업 중단",
    "event_english": "Rental Business Suspension",
    "description": null,
    "created_at": "2024-11-01T00:00:00",
    "updated_at": "2024-11-01T00:00:00"
  },
  {
    "id": 2,
    "date_start": "2025-03-15",
    "date_end": "2025-03-20",
    "event_korean": "봄학기 개강",
    "event_english": "Spring Semester Begins",
    "description": "2025년 봄학기 개강일",
    "created_at": "2024-12-01T10:30:00",
    "updated_at": "2024-12-01T10:30:00"
  }
]
```

---

### 2. 조건부 행사 일정 조회

**엔드포인트**: `GET /api/calendar/events`

**설명**: 쿼리 파라미터로 조건을 지정하여 행사 일정을 조회합니다.

**쿼리 파라미터** (모두 선택):
- `year`: 연도 (예: "2024", "2025")
- `month`: 월 (예: "01", "12")
- `startDate`: 시작 날짜 (YYYY-MM-DD 형식)
- `endDate`: 종료 날짜 (YYYY-MM-DD 형식)

**예시 요청**:
```
GET /api/calendar/events?year=2025&month=03
GET /api/calendar/events?startDate=2025-01-01&endDate=2025-12-31
GET /api/calendar/events?year=2024
```

**성공 응답** (200 OK): 배열 형식 (위와 동일)

---

### 3. 특정 행사 일정 상세 조회

**엔드포인트**: `GET /api/calendar/events/{id}`

**경로 파라미터**:
- `id`: 행사 일정 ID (number)

**예시 요청**:
```
GET /api/calendar/events/1
```

**성공 응답** (200 OK):
```json
{
  "id": 1,
  "date_start": "2024-12-02",
  "date_end": "2024-12-13",
  "event_korean": "대여사업 중단",
  "event_english": "Rental Business Suspension",
  "description": null,
  "created_at": "2024-11-01T00:00:00",
  "updated_at": "2024-11-01T00:00:00"
}
```

**에러 응답** (404 Not Found):
```json
{
  "message": "행사 일정을 찾을 수 없습니다. ID: 1"
}
```

---

### 4. 행사 일정 생성

**엔드포인트**: `POST /api/calendar/events`

**요청 본문**:
```json
{
  "date_start": "2025-03-15",           // 필수, YYYY-MM-DD 형식
  "date_end": "2025-03-20",             // 필수, YYYY-MM-DD 형식
  "event_korean": "행사명 (한글)",       // 필수, 최소 1자 이상
  "event_english": "Event Name",        // 선택
  "description": "행사 설명"            // 선택
}
```

**성공 응답** (201 Created):
```json
{
  "id": 3,
  "date_start": "2025-03-15",
  "date_end": "2025-03-20",
  "event_korean": "행사명 (한글)",
  "event_english": "Event Name",
  "description": "행사 설명",
  "created_at": "2025-02-08T12:00:00",
  "updated_at": "2025-02-08T12:00:00"
}
```

**에러 응답** (400 Bad Request):
```json
{
  "message": "종료일은 시작일 이후여야 합니다."
}
```
또는
```json
{
  "message": "시작 날짜는 필수입니다."
}
```

---

### 5. 행사 일정 수정

**엔드포인트**: `PUT /api/calendar/events/{id}`

**경로 파라미터**:
- `id`: 행사 일정 ID (number)

**요청 본문**: 생성과 동일한 형식 (모든 필드 선택)
```json
{
  "date_start": "2025-03-16",           // 선택
  "date_end": "2025-03-21",             // 선택
  "event_korean": "수정된 행사명",      // 선택
  "event_english": "Updated Event",     // 선택
  "description": "수정된 설명"          // 선택
}
```

**성공 응답** (200 OK): 수정된 객체 반환 (위와 동일)

**에러 응답**:
- 404 Not Found: 행사 일정을 찾을 수 없음
- 400 Bad Request: 유효성 검증 실패

---

### 6. 행사 일정 삭제

**엔드포인트**: `DELETE /api/calendar/events/{id}`

**경로 파라미터**:
- `id`: 행사 일정 ID (number)

**예시 요청**:
```
DELETE /api/calendar/events/1
```

**성공 응답** (204 No Content): 본문 없음

**에러 응답** (404 Not Found):
```json
{
  "message": "행사 일정을 찾을 수 없습니다. ID: 1"
}
```

---

## 데이터 형식 규칙

### 필드명
- 모든 필드명은 **snake_case** 형식을 사용합니다.
  - `date_start`, `date_end`, `event_korean`, `event_english`, `created_at`, `updated_at`

### 날짜 형식
- 날짜 필드 (`date_start`, `date_end`): `YYYY-MM-DD` 형식 (예: "2025-03-15")
- 타임스탬프 필드 (`created_at`, `updated_at`): `YYYY-MM-DDTHH:mm:ss` 형식 (예: "2024-11-01T00:00:00")

### 필수 필드
- `date_start`: 필수
- `date_end`: 필수
- `event_korean`: 필수 (최소 1자 이상)

### 선택 필드
- `event_english`: 선택
- `description`: 선택

### 유효성 검증 규칙
1. `date_end >= date_start` (종료일은 시작일 이후여야 함)
2. `event_korean`은 최소 1자 이상이어야 함
3. 날짜 형식은 반드시 `YYYY-MM-DD` 형식이어야 함

---

## 에러 처리

모든 에러 응답은 다음 형식을 따릅니다:

```json
{
  "message": "에러 메시지"
}
```

### HTTP 상태 코드
- `200 OK`: 성공 (조회, 수정)
- `201 Created`: 성공 (생성)
- `204 No Content`: 성공 (삭제)
- `400 Bad Request`: 잘못된 요청 (유효성 검증 실패)
- `404 Not Found`: 리소스를 찾을 수 없음

## 주의사항

1. **인증**: 현재는 인증이 없지만, 관리자 페이지이므로 추후 JWT 인증이 추가될 수 있습니다. 인증이 추가되면 모든 요청에 `Authorization: Bearer {token}` 헤더가 필요합니다.

2. **CORS**: 백엔드에서 CORS가 설정되어 있으므로, 프론트엔드 도메인에서 자동으로 허용됩니다.

3. **날짜 형식**: 날짜는 반드시 `YYYY-MM-DD` 형식으로 전송해야 합니다. (예: "2025-03-15")

4. **에러 처리**: 모든 API 호출에 대해 적절한 에러 처리를 구현하세요.

5. **유효성 검증**: 프론트엔드에서도 기본적인 유효성 검증을 수행하는 것을 권장합니다:
   - `date_end >= date_start` 확인
   - `event_korean` 최소 1자 확인
   - 날짜 형식 검증

---

## 테스트용 cURL 명령어

```bash
# 전체 조회
curl -X GET http://localhost:8080/api/calendar/events/all

# 조건부 조회 (2025년 3월)
curl -X GET "http://localhost:8080/api/calendar/events?year=2025&month=03"

# 상세 조회
curl -X GET http://localhost:8080/api/calendar/events/1

# 생성
curl -X POST http://localhost:8080/api/calendar/events \
  -H "Content-Type: application/json" \
  -d '{
    "date_start": "2025-03-15",
    "date_end": "2025-03-20",
    "event_korean": "봄학기 개강",
    "event_english": "Spring Semester Begins",
    "description": "2025년 봄학기 개강일"
  }'

# 수정
curl -X PUT http://localhost:8080/api/calendar/events/1 \
  -H "Content-Type: application/json" \
  -d '{
    "event_korean": "수정된 행사명",
    "description": "수정된 설명"
  }'

# 삭제
curl -X DELETE http://localhost:8080/api/calendar/events/1
```
