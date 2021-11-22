ARG DEBIAN_VERSION=stretch-slim 

##### Building stage #####
FROM debian:${DEBIAN_VERSION} as builder
MAINTAINER Tareq Alqutami <tareqaziz2010@gmail.com>

# Versions of nginx, rtmp-module and ffmpeg && nodejs
ARG  NGINX_VERSION=1.17.5
ARG  NGINX_RTMP_MODULE_VERSION=1.2.1
ARG  FFMPEG_VERSION=4.2.1
ARG  NODEJS_VERSION=v14.18.1-linux-x64

# Install dependencies
RUN apt-get update && \
	apt-get install -y \
		wget build-essential ca-certificates \
		openssl libssl-dev yasm \
		libpcre3-dev librtmp-dev libtheora-dev \
		libvorbis-dev libvpx-dev libfreetype6-dev \
		libmp3lame-dev libx264-dev libx265-dev && \
    rm -rf /var/lib/apt/lists/*
	
# Download ffmpeg source
RUN mkdir -p /tmp/build && cd /tmp/build && \
  wget http://ffmpeg.org/releases/ffmpeg-${FFMPEG_VERSION}.tar.gz && \
  tar -zxf ffmpeg-${FFMPEG_VERSION}.tar.gz && \
  rm ffmpeg-${FFMPEG_VERSION}.tar.gz
  
# Build ffmpeg
RUN cd /tmp/build/ffmpeg-${FFMPEG_VERSION} && \
  ./configure \
	  --enable-version3 \
	  --enable-gpl \
	  --enable-small \
	  --enable-libx264 \
	  --enable-libx265 \
	  --enable-libvpx \
	  --enable-libtheora \
	  --enable-libvorbis \
	  --enable-librtmp \
	  --enable-postproc \
	  --enable-swresample \ 
	  --enable-libfreetype \
	  --enable-libmp3lame \
	  --disable-debug \
	  --disable-doc \
	  --disable-ffplay \
	  --extra-libs="-lpthread -lm" && \
	make -j $(getconf _NPROCESSORS_ONLN) && \
	make install

# Install nodejs
RUN cd /tmp/build && \
  wget https://nodejs.org/dist/v14.18.1/node-${NODEJS_VERSION}.tar.gz && \
  tar -zxf node-${NODEJS_VERSION}.tar.gz && \
  rm node-${NODEJS_VERSION}.tar.gz &&\
  cp -r node-${NODEJS_VERSION}/* /usr/local &&\
  rm -R node-${NODEJS_VERSION}
	
# cleaning build files
RUN rm -rf /tmp/build


##### Building the final image #####
FROM debian:${DEBIAN_VERSION}

# Install dependencies
RUN apt-get update && \
	apt-get install -y \
		ca-certificates openssl libpcre3-dev \
		librtmp1 libtheora0 libvorbis-dev libmp3lame0 \
		libvpx4 libx264-dev libx265-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy files from build stage to final stage	
COPY --from=builder /usr/local /usr/local

# Forward logs to Docker
RUN npm i fluent-ffmpeg -g && npm i pm2 -g
