FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=80 DATA_DIR=/data TZ=Asia/Shanghai
COPY package.json ./
RUN npm install --omit=dev --omit=optional --no-audit --no-fund && npm cache clean --force
COPY server.js agents.js kb.js index.html admin.html app.js scene.js ./
RUN mkdir -p /data && node --check server.js && node --check agents.js && node --check kb.js \
 && test -s node_modules/three/build/three.module.min.js && test -s node_modules/react-dom/umd/react-dom.production.min.js \
 && test -s node_modules/pdfjs-dist/build/pdf.min.mjs && test -s node_modules/mammoth/mammoth.browser.min.js
VOLUME ["/data"]
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget --spider -q http://127.0.0.1/healthz || exit 1
CMD ["node", "server.js"]
