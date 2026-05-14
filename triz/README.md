# TRIZ Learning Site

이 구조는 메인 `index.html`과 TRIZ 개별 모듈 `/triz/`를 분리한 정적 웹사이트 구조입니다.

## 폴더 구조

```text
/
├─ index.html
├─ shared/
│  └─ css/common.css
├─ triz/
│  ├─ index.html
│  ├─ css/triz.css
│  ├─ js/triz-app.js
│  └─ data/
│     ├─ triz-data.xlsx
│     └─ triz-data.json
└─ tools/
   └─ excel_to_json.py
```

## 수동 변환 방식

1. `triz/data/triz-data.xlsx` 파일을 엽니다.
2. `principles`, `examples`, `parameters`, `matrix`, `quiz`, `icons`, `categories`, `groups` 시트를 수정합니다.
3. 저장합니다.
4. 터미널에서 아래 명령을 실행합니다.

```bash
python tools/excel_to_json.py triz/data/triz-data.xlsx triz/data/triz-data.json
```

5. 변경된 `triz-data.xlsx`와 `triz-data.json`을 함께 GitHub에 업로드/커밋합니다.
6. GitHub Pages에서 `/triz/` 페이지를 새로고침하여 확인합니다.

주의: 브라우저 캐시 때문에 바로 보이지 않을 수 있습니다. 이 경우 강력 새로고침(Ctrl+F5) 또는 몇 분 후 확인하세요.
