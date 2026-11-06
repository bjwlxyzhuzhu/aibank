FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=80 DATA_DIR=/data TZ=Asia/Shanghai
COPY package.json server.js agents.js index.html admin.html ./
RUN mkdir -p /data && test -s index.html && test -s admin.html && node --check server.js && node --check agents.js
VOLUME ["/data"]
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget --spider -q http://127.0.0.1/healthz || exit 1
CMD ["node", "server.js"]
