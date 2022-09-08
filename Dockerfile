# Frontend build based on Node.js
FROM node:16-alpine as build-stage
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package.json .
COPY yarn.lock .
RUN yarn install --immutable --immutable-cache --check-cache
COPY . /usr/src/app
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
RUN yarn run build

# Stage 1
# Production build based on Nginx with artifacts from Stage 0
FROM nginx:1.20.2-alpine
# COPY config/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
