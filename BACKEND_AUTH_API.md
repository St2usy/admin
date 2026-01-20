# 백엔드 인증 API 구현 가이드

프론트엔드 관리자 홈페이지가 기대하는 인증 API 명세입니다.

## 필수 엔드포인트

### 1. 로그인

**엔드포인트**: `POST /api/auth/login`

**요청 본문**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

**성공 응답** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin"
}
```

**실패 응답** (401 Unauthorized):
```json
{
  "message": "사용자명 또는 비밀번호가 올바르지 않습니다."
}
```

### 2. 토큰 검증

**엔드포인트**: `GET /api/auth/verify`

**헤더**:
```
Authorization: Bearer {token}
```

**성공 응답** (200 OK):
```json
{
  "valid": true,
  "username": "admin"
}
```

**실패 응답** (401 Unauthorized):
```json
{
  "message": "유효하지 않은 토큰입니다."
}
```

### 3. 로그아웃

**엔드포인트**: `POST /api/auth/logout`

**헤더**:
```
Authorization: Bearer {token}
```

**성공 응답** (200 OK):
```json
{
  "message": "로그아웃되었습니다."
}
```

## 구현 예시 (Spring Boot)

### Controller

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request.getUsername(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new LoginResponse(null, null));
        }
    }
    
    @GetMapping("/verify")
    public ResponseEntity<VerifyResponse> verify(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        if (authService.validateToken(token)) {
            return ResponseEntity.ok(new VerifyResponse(true, authService.getUsernameFromToken(token)));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new VerifyResponse(false, null));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        authService.logout(token);
        return ResponseEntity.ok(Map.of("message", "로그아웃되었습니다."));
    }
}
```

### DTO

```java
public class LoginRequest {
    private String username;
    private String password;
    // getters, setters
}

public class LoginResponse {
    private String token;
    private String username;
    // getters, setters, constructor
}

public class VerifyResponse {
    private boolean valid;
    private String username;
    // getters, setters, constructor
}
```

## 간단한 구현 (개발/테스트용)

H2 DB를 사용하는 간단한 구현 예시:

### 1. User Entity

```java
@Entity
@Table(name = "admin_users")
public class AdminUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    // getters, setters
}
```

### 2. 간단한 인증 서비스

```java
@Service
public class AuthService {
    
    @Autowired
    private AdminUserRepository userRepository;
    
    private final String SECRET_KEY = "your-secret-key"; // 실제로는 환경 변수로 관리
    
    public LoginResponse login(String username, String password) {
        AdminUser user = userRepository.findByUsername(username)
            .orElseThrow(() -> new AuthenticationException("사용자를 찾을 수 없습니다."));
        
        // 비밀번호 검증 (실제로는 BCrypt 등 사용)
        if (!user.getPassword().equals(password)) {
            throw new AuthenticationException("비밀번호가 올바르지 않습니다.");
        }
        
        // JWT 토큰 생성 (또는 간단한 토큰)
        String token = generateToken(username);
        
        return new LoginResponse(token, username);
    }
    
    public boolean validateToken(String token) {
        // 토큰 검증 로직
        try {
            // JWT 파싱 및 검증
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    public String getUsernameFromToken(String token) {
        // 토큰에서 사용자명 추출
        return "admin"; // 예시
    }
    
    public void logout(String token) {
        // 토큰 무효화 로직 (선택사항)
    }
    
    private String generateToken(String username) {
        // 간단한 토큰 생성 (실제로는 JWT 라이브러리 사용 권장)
        return Base64.getEncoder().encodeToString((username + ":" + System.currentTimeMillis()).getBytes());
    }
}
```

### 3. 초기 데이터 설정 (data.sql)

```sql
INSERT INTO admin_users (username, password) VALUES ('admin', 'admin123');
```

## 보안 고려사항

1. **비밀번호 해싱**: 실제 운영 환경에서는 BCrypt 등으로 비밀번호를 해싱해야 합니다.
2. **JWT 사용**: 간단한 토큰 대신 JWT를 사용하는 것을 권장합니다.
3. **토큰 만료**: 토큰에 만료 시간을 설정해야 합니다.
4. **HTTPS**: 프로덕션 환경에서는 반드시 HTTPS를 사용해야 합니다.

## 테스트용 간단한 구현

개발 초기 단계에서는 다음과 같이 간단하게 구현할 수 있습니다:

```java
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    // 테스트용: 하드코딩된 인증
    if ("admin".equals(request.getUsername()) && "admin123".equals(request.getPassword())) {
        String token = "test-token-" + System.currentTimeMillis();
        return ResponseEntity.ok(new LoginResponse(token, request.getUsername()));
    }
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}

@GetMapping("/verify")
public ResponseEntity<VerifyResponse> verify(@RequestHeader("Authorization") String authHeader) {
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        return ResponseEntity.ok(new VerifyResponse(true, "admin"));
    }
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
}
```

이렇게 하면 프론트엔드와 연동하여 테스트할 수 있습니다.
