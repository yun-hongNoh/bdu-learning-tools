# BDU-X 창의적 문제해결 학습도구 허브

여러 강의용 웹 시뮬레이터를 하나의 GitHub Pages 저장소에서 운영하기 위한 구조입니다.

## 현재 포함 모듈

1. `/triz/`  
   TRIZ 40가지 발명원리, 사례 퀴즈, 39×39 모순 매트릭스

2. `/week04-02-contradiction-scanner/`  
   4주 2강 · 모순 구조 스캐너

## 권장 구조

- 메인 `index.html`: 전체 학습도구 허브
- 각 학습도구: 별도 폴더의 `index.html`
- 데이터가 필요한 도구: 각 폴더 안의 `/data/` 사용
- 공통 디자인: `/shared/` 사용

## 로컬 실행

- `/triz/`는 JSON을 읽기 때문에 로컬에서 파일 더블클릭 시 데이터 파일 선택 방식으로 동작합니다.
- `/week04-02-contradiction-scanner/`는 단일 HTML이므로 더블클릭으로도 실행 가능합니다.

GitHub Pages에 업로드하면 각 경로는 다음처럼 접속할 수 있습니다.

- `/`
- `/triz/`
- `/week04-02-contradiction-scanner/`
