FROM docker.io/node:22-alpine
ENV NODE_ENV=production

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY . .

# run as non-root user for security
USER node
EXPOSE 3000

# use node directly instead of npm to avoid extra process overhead
# --max-old-space-size keeps memory usage reasonable on small VPS
CMD ["node", "--max-old-space-size=256", "server.js"]
