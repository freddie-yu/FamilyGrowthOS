FROM node:22.23.4-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY shared/package.json shared/package.json
COPY miniprogram/package.json miniprogram/package.json
COPY web-admin/package.json web-admin/package.json
RUN npm ci --ignore-scripts
COPY tsconfig.base.json ./
COPY server/ server/
COPY shared/ shared/
RUN npm run build --workspace server

FROM node:22.23.4-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production APP_ENV=prod PORT=8080 TZ=Asia/Shanghai
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/server/package.json server/package.json
COPY --from=build /app/shared/package.json shared/package.json
COPY --from=build /app/miniprogram/package.json miniprogram/package.json
COPY --from=build /app/web-admin/package.json web-admin/package.json
RUN npm ci --omit=dev --ignore-scripts --workspace server --workspace shared && npm cache clean --force
COPY --from=build /app/server/dist ./server/dist
USER node
EXPOSE 8080
CMD ["node", "server/dist/server/src/index.js"]
