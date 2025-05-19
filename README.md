# IMOS Front-end

이 프로젝트는 IMOS 시스템의 프론트엔드 애플리케이션입니다. React를 기반으로 구축되었으며, 다양한 모듈과 기능을 사용자에게 제공합니다.

## 주요 기술 스택

*   **React:** 사용자 인터페이스 구축을 위한 JavaScript 라이브러리
*   **@mui/material:** Google의 Material Design을 구현한 React UI 프레임워크
*   **@apollo/client:** GraphQL 클라이언트
*   **react-router-dom:** React 애플리케이션을 위한 선언적 라우팅
*   **recharts:** React 기반의 차트 라이브러리
*   **Context API:** React의 상태 관리 기능 (Tab, Theme, Domain 컨텍스트)

## 주요 기능

*   **인증:** 로그인 및 프로필 관리 기능
*   **동적 테마:** 라이트/다크 모드 및 도메인별 테마 지원 (IMOS, PEMS)
*   **반응형 디자인:** 데스크톱, 모바일, 태블릿 등 다양한 디바이스 지원
*   **탭 기반 인터페이스:** 여러 기능을 탭으로 관리
*   **GraphQL API 연동:** Apollo Client를 통한 데이터 통신

## 시작하기

### 사전 요구 사항

*   Node.js (버전 16 이상 권장)
*   npm 또는 yarn

### 설치 및 실행

1.  프로젝트 저장소를 클론합니다:
    ```bash
    git clone https://github.com/your-repository/imos-front-end.git
    cd imos-front-end
    ```

2.  필요한 패키지를 설치합니다:
    ```bash
    npm install
    # 또는
    # yarn install
    ```

3.  개발 모드로 애플리케이션을 실행합니다:
    ```bash
    npm start
    ```
    애플리케이션은 기본적으로 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 사용 가능한 스크립트

프로젝트 디렉토리에서 다음 스크립트를 실행할 수 있습니다:

### `npm start`

개발 모드로 앱을 실행합니다.\\
브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인할 수 있습니다.

변경 사항이 있을 때마다 페이지가 자동으로 새로고침됩니다.\\
콘솔에서 린트 오류를 확인할 수도 있습니다.

### `npm test`

대화형 관찰 모드에서 테스트 러너를 실행합니다.\\
자세한 정보는 [running tests](https://facebook.github.io/create-react-app/docs/running-tests) 섹션을 참조하세요.

### `npm run build`

프로덕션용으로 앱을 `build` 폴더에 빌드합니다.\\
React를 프로덕션 모드로 올바르게 번들링하고 최상의 성능을 위해 빌드를 최적화합니다.

빌드는 최소화되며 파일 이름에는 해시가 포함됩니다.\\
이제 앱을 배포할 준비가 되었습니다!

자세한 정보는 [deployment](https://facebook.github.io/create-react-app/docs/deployment) 섹션을 참조하세요.

### `npm run eject`

**참고: 이것은 단방향 작업입니다. `eject`를 실행하면 되돌릴 수 없습니다!**

빌드 도구 및 구성 선택에 만족하지 않으면 언제든지 `eject`할 수 있습니다. 이 명령은 프로젝트에서 단일 빌드 종속성을 제거합니다.

대신 모든 구성 파일과 전이 종속성(webpack, Babel, ESLint 등)을 프로젝트에 직접 복사하여 완전히 제어할 수 있도록 합니다. `eject`를 제외한 모든 명령은 계속 작동하지만 복사된 스크립트를 가리키므로 조정할 수 있습니다. 이 시점부터는 직접 관리해야 합니다.

`eject`를 사용할 필요는 없습니다. 선별된 기능 세트는 소규모 및 중간 규모 배포에 적합하며 이 기능을 사용해야 한다는 의무감을 느낄 필요는 없습니다. 그러나 준비가 되었을 때 사용자 정의할 수 없다면 이 도구가 유용하지 않다는 것을 이해합니다.

## 더 알아보기

[Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)에서 더 많은 정보를 얻을 수 있습니다.

React를 배우려면 [React documentation](https://reactjs.org/)을 확인하세요.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
