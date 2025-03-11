# Figma to React Component Converter

Figma 디자인을 React 컴포넌트로 자동 변환하는 도구입니다.

## 주요 기능

- Figma 파일에서 컴포넌트 자동 추출
- React 컴포넌트 코드 자동 생성
- CSS 모듈 스타일 코드 생성
- 컴포넌트 미리보기 지원
- 생성된 코드 복사 및 다운로드 기능

## 시작하기

### 사전 요구사항

- Node.js (v14 이상)
- npm 또는 yarn
- Figma 계정 및 Personal Access Token

### 설치

```bash
# 프로젝트 클론
git clone https://github.com/dchkang83/figma-projects.git

# 디렉토리 이동
cd figma-projects/figma-to-react

# 의존성 설치
npm install
```

### 환경 설정

1. `.env.example` 파일을 `.env`로 복사합니다.
2. `.env` 파일에 Figma API 토큰과 파일 키를 설정합니다:

```env
REACT_APP_FIGMA_ACCESS_TOKEN=your_figma_access_token_here
REACT_APP_FIGMA_FILE_KEY=your_figma_file_key_here
```

### 실행

```bash
npm start
```

## 사용 방법

1. Figma 파일에서 컴포넌트를 선택합니다.
2. "React 컴포넌트 생성" 버튼을 클릭합니다.
3. 생성된 JSX와 CSS 코드를 확인합니다.
4. 코드를 복사하거나 파일로 다운로드합니다.

## 주요 기술 스택

- React.js
- Figma API
- CSS Modules
- classnames

## 프로젝트 구조

```
figma-to-react/
├── src/
│   ├── components/     # React 컴포넌트
│   ├── services/      # Figma API 서비스
│   ├── utils/         # 유틸리티 함수
│   ├── App.js         # 메인 애플리케이션
│   └── App.css        # 스타일
└── public/            # 정적 파일
```

## 보안 주의사항

- `.env` 파일은 절대로 Git에 커밋하지 마세요.
- Figma Personal Access Token은 안전하게 보관하세요.
- `.env.example` 파일을 참고하여 본인의 `.env` 파일을 생성하세요.

## 라이선스

MIT License
