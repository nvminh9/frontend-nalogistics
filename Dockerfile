## BUILD STAGE ##
FROM node:22.15.1-alpine3.20 AS build
WORKDIR /app
COPY . .
RUN npm install --force
RUN npm run build --configuration=production

## RUN STAGE  ##
FROM nginx:1.29.1-alpine AS nginx
COPY --from=build /app/dist/logictic-app-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
