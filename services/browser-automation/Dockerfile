# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: services/browser-automation/Dockerfile
# LAYER: root
# 
#         _   _  _____    _  __   __
#        | | | || ____|  / \ \  / /
#        | |_| ||  _|   / _ \ \ V / 
#        |  _  || |___ / ___ \ | |  
#        |_| |_||_____/_/   \_\|_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

# Browser Automation Service for HeadySystems
FROM mcr.microsoft.com/playwright:v1.41.1-jammy

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose service port
EXPOSE 9222

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9222/health || exit 1

# Start the automation service
CMD ["node", "dist/index.js"]
