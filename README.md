# 여행 지출

여행 중 지출을 기록하고 관리하는 웹 앱입니다.  
Supabase로 데이터를 저장하고, Cloudflare Pages로 배포해 외부에서도 사용할 수 있습니다.

## 기술 스택

- **React** + **Vite** (JSX)
- **Tailwind CSS** + **SCSS** — 스타일링
- **Supabase** — 데이터베이스 및 Realtime 구독
- **Cloudflare Pages** — 배포

## 프로젝트 구조

```
src/
├── pages/
│   └── ExpensePage.jsx          # 메인 페이지 (상태 관리 및 CRUD)
├── components/
│   ├── layout/
│   │   └── Header.jsx           # 여행명 입력, 연결 상태 표시
│   ├── expense/
│   │   ├── SummaryGrid.jsx      # 엔화·한화 합계 카드
│   │   ├── ExpenseForm.jsx      # 지출 입력 폼
│   │   ├── FilterBar.jsx        # 검색 및 여행지 필터
│   │   └── ExpenseTable.jsx     # 지출 내역 테이블
│   └── common/
│       └── Toast.jsx            # 알림 토스트
├── utils/
│   └── supabase.js              # Supabase 클라이언트
└── styles/
    ├── tailwind.css             # CSS 변수 + Tailwind directives
    └── main.scss                # 전역 SCSS
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 테이블 생성

Supabase 대시보드 → **SQL Editor**에서 `supabase-schema.sql`을 실행합니다.

```bash
# 파일 위치
supabase-schema.sql
```

### 3. 환경변수 설정

`.env.example`을 복사해 `.env`를 만들고 Supabase 정보를 입력합니다.

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Supabase URL과 anon key는 **Project Settings → API**에서 확인할 수 있습니다.

### 4. 로컬 개발 서버 실행

```bash
npm run dev
```

## 배포 (Cloudflare Pages)

### 빌드

```bash
npm run build
# dist/ 폴더가 생성됩니다
```

### Cloudflare Pages 연결

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create application** → **Pages**
2. GitHub 저장소 연결 또는 `dist/` 폴더 직접 업로드
3. 빌드 설정:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. **Environment variables**에 `.env`의 값을 동일하게 추가

> `public/_redirects`에 SPA 라우팅 설정이 포함되어 있어 별도 작업이 필요 없습니다.

## 주요 기능

- 지출 항목 추가 / 삭제 (날짜, 내역, 여행지, 구입처, 엔화, 한화, 메모)
- Supabase Realtime — 여러 기기에서 동시에 사용 시 자동 동기화
- 검색 및 여행지 필터
- 전체 지출 합계 (엔화 / 한화)
- JSON 내보내기
