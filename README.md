# 나만의 할 일 목록

혼자 사용할 수 있는 간단한 할 일 목록 웹앱입니다. 할 일을 추가하고, 완료 상태를 바꾸고, 삭제할 수 있습니다.

## 실행하기

프로젝트 폴더에서 아래 명령어를 실행한 다음, 브라우저에서 [http://localhost:3000](http://localhost:3000)을 여세요.

```bash
npm install
npm run dev
```

## 데이터 저장

할 일은 현재 브라우저의 `localStorage`에 저장됩니다. 같은 브라우저와 프로필에서 다시 열면 남아 있지만, 다른 기기와 동기화되지 않으며 브라우저의 사이트 데이터를 지우면 할 일도 삭제됩니다.

저장 관련 코드는 [`lib/todo-storage.ts`](./lib/todo-storage.ts)에 모았습니다. 나중에 데이터베이스를 연결할 때 이 파일의 저장 기능을 바꾸면 됩니다.

## 확인 명령어

```bash
npm run lint
npm run build
```
