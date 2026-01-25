# Docker 배포 가이드

## 사전 준비

1. 서버에 Docker와 Docker Compose 설치
2. 백엔드 API 서버의 IP 주소 확인

## 배포 방법

### 방법 1: Docker Compose 사용 (권장)

1. **환경 변수 파일 생성**

```bash
cp .env.production.example .env.production
```

`.env.production` 파일을 열어 백엔드 API URL을 설정합니다:

```env
VITE_API_BASE_URL=http://YOUR_BACKEND_IP:8080
```

2. **이미지 빌드 및 실행**

```bash
docker-compose up -d --build
```

3. **로그 확인**

```bash
docker-compose logs -f
```

4. **중지 및 제거**

```bash
docker-compose down
```

### 방법 2: Docker 명령어 직접 사용

1. **환경 변수 설정**

```bash
export VITE_API_BASE_URL=http://YOUR_BACKEND_IP:8080
```

2. **이미지 빌드**

```bash
docker build \
  --build-arg VITE_API_BASE_URL=$VITE_API_BASE_URL \
  -t admin-frontend:latest .
```

3. **컨테이너 실행**

```bash
docker run -d \
  --name admin-frontend \
  -p 80:80 \
  --restart unless-stopped \
  admin-frontend:latest
```

4. **로그 확인**

```bash
docker logs -f admin-frontend
```

5. **중지 및 제거**

```bash
docker stop admin-frontend
docker rm admin-frontend
```

## 접속 확인

배포 완료 후 브라우저에서 다음 주소로 접속:

```
http://YOUR_SERVER_IP
```

## 문제 해결

### 포트가 이미 사용 중인 경우

포트 80이 이미 사용 중이라면 `docker-compose.yml`의 포트 매핑을 변경:

```yaml
ports:
  - "8080:80"  # 호스트의 8080 포트로 접속
```

### 백엔드 API 연결 오류

1. `.env.production`의 `VITE_API_BASE_URL` 확인
2. 백엔드 서버가 실행 중인지 확인
3. 방화벽 설정 확인 (포트 8080이 열려있는지)

### CORS 오류

백엔드 서버에서 프론트엔드 도메인/IP를 CORS 허용 목록에 추가해야 합니다.

### 빌드 실패

1. Docker가 정상적으로 설치되어 있는지 확인
2. `docker-compose logs`로 빌드 로그 확인
3. `.dockerignore`에 필요한 파일이 제외되지 않았는지 확인

## 향후 HTTPS 설정 (도메인 발급 후)

도메인을 발급받은 후 HTTPS를 설정하려면:

1. **Nginx 설정 수정** (`nginx.conf`)
   - SSL 인증서 설정 추가
   - HTTP → HTTPS 리다이렉트 추가

2. **Let's Encrypt 사용 예시**

```bash
# Certbot 설치
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 인증서 발급
sudo certbot --nginx -d yourdomain.com
```

3. **Docker Compose에 볼륨 마운트 추가**

```yaml
volumes:
  - ./certbot/conf:/etc/letsencrypt
  - ./certbot/www:/var/www/certbot
```

## 업데이트 배포

코드 변경 후 재배포:

```bash
# Docker Compose 사용
docker-compose up -d --build

# 또는 Docker 직접 사용
docker build --build-arg VITE_API_BASE_URL=$VITE_API_BASE_URL -t admin-frontend:latest .
docker stop admin-frontend
docker rm admin-frontend
docker run -d --name admin-frontend -p 80:80 --restart unless-stopped admin-frontend:latest
```
