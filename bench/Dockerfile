# Image quality benchmark: the official WordPress image (PHP GD and Imagick as real hosts ship them),
# wasm-vips for the browser path, and the scoring tools.
FROM wordpress:php8.3-apache

RUN apt-get update && apt-get install -y --no-install-recommends \
		build-essential cmake git pkg-config ca-certificates curl \
		libbrotli-dev libgif-dev libjpeg-dev libpng-dev libwebp-dev liblcms2-dev libhwy-dev zlib1g-dev \
		libavif-bin webp ffmpeg imagemagick nodejs npm cargo \
	&& rm -rf /var/lib/apt/lists/*

# SSIMULACRA 2 and Butteraugli come with libjxl's dev tools.
RUN git clone --depth 1 --branch v0.11.1 --recursive --shallow-submodules https://github.com/libjxl/libjxl.git /tmp/libjxl \
	&& cmake -S /tmp/libjxl -B /tmp/libjxl/build -DCMAKE_BUILD_TYPE=Release -DBUILD_TESTING=OFF -DJPEGXL_ENABLE_DEVTOOLS=ON \
		-DJPEGXL_ENABLE_BENCHMARK=OFF -DJPEGXL_ENABLE_EXAMPLES=OFF -DJPEGXL_ENABLE_MANPAGES=OFF -DJPEGXL_ENABLE_SJPEG=OFF \
		-DJPEGXL_ENABLE_OPENEXR=OFF -DJPEGXL_ENABLE_JPEGLI=OFF -DJPEGXL_FORCE_SYSTEM_HWY=ON -DJPEGXL_FORCE_SYSTEM_BROTLI=ON \
	&& cmake --build /tmp/libjxl/build -j"$(nproc)" --target ssimulacra2 butteraugli_main \
	&& cp /tmp/libjxl/build/tools/ssimulacra2 /tmp/libjxl/build/tools/butteraugli_main /usr/local/bin/ \
	&& rm -rf /tmp/libjxl

RUN cargo install --locked --root /usr/local dssim --version 3.4.0 && rm -rf /root/.cargo

RUN mkdir /opt/vips && cd /opt/vips && npm init -y >/dev/null && npm install wasm-vips@0.0.19

# Debian's ffmpeg has no libvmaf, so VMAF scoring uses a static ffmpeg 9.0 build.
RUN curl -sSL https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n9.0-latest-linux64-gpl-9.0.tar.xz | tar -xJ -C /opt \
	&& ln -s /opt/ffmpeg-n9.0-latest-linux64-gpl-9.0/bin/ffmpeg /usr/local/bin/ffmpeg-vmaf
