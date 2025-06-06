# 1단계: React 앱 빌드
FROM node:23.10.0 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./
RUN rm -rf build && npm run build

# 2️⃣ Nginx 기반으로 정적 파일 제공 (배포 단계)a
FROM nginx:latest

# Nginx 기본 설정 파일 삭제 후 프로젝트 내부 `default.conf` 복사
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# React에서 빌드된 정적 파일을 Nginx의 기본 서비스 경로로 복사
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]