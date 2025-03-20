# 1️⃣ Node.js 기반으로 React 빌드 (빌드 단계)
FROM node:18 AS build

WORKDIR /app

# package.json과 package-lock.json 복사 후 의존성 설치
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# React 프로젝트 파일 복사 및 빌드 실행
COPY . .
RUN npm run build

# 2️⃣ Nginx 기반으로 정적 파일 제공 (배포 단계)
FROM nginx:alpine

# Nginx 기본 설정 파일 삭제 후 프로젝트 내부 `default.conf` 복사
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# React에서 빌드된 정적 파일을 Nginx의 기본 서비스 경로로 복사
COPY --from=build /app/build /usr/share/nginx/html

# 컨테이너가 시작될 때 Nginx 실행
CMD ["nginx", "-g", "daemon off;"]