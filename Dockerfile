FROM node:22-alpine

RUN apk add --no-cache \
    python3 \
    py3-pip \
    pkgconfig \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev \
    build-base \
    g++ \
    make

WORKDIR /app

COPY package*.json ./
RUN YOUTUBE_DL_SKIP_PYTHON_CHECK=1 npm install --omit=dev

COPY . .

CMD ["node", "index.js"]
