// Media configuration for CDN and asset management

interface MediaConfig {
  // CDN Base URLs
  cdnBaseUrl: string;
  s3BaseUrl: string;
  
  // Video assets
  videos: {
    heroBackground: string;
  };
  
  // Image fallbacks
  images: {
    heroFallback: string;
  };
}

const isProduction = process.env.NODE_ENV === 'production';
const publicMediaBaseUrl = (
  import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL
  || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev'
).replace(/\/+$/, '');

export const PUBLIC_MEDIA_BASE_URL = publicMediaBaseUrl;
export const LOW_MEDIA_BASE_URL = `${publicMediaBaseUrl}/low`;

// CDN 配置（生产环境）
const PRODUCTION_CONFIG: MediaConfig = {
  cdnBaseUrl: publicMediaBaseUrl,
  s3BaseUrl: 'https://medchina-videos.s3.amazonaws.com',
  
  videos: {
    heroBackground: 'https://d10cuoob0h07to.cloudfront.net/videos/front.mp4'  // 视频仍使用视频分发域名
  },
  
  images: {
    heroFallback: 'https://images.unsplash.com/photo-1587351021759-3e566b3db4f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  }
};

// 开发环境配置 - 也使用 CDN 以确保图片正常加载
const DEVELOPMENT_CONFIG: MediaConfig = {
  cdnBaseUrl: publicMediaBaseUrl,
  s3BaseUrl: 'https://medchina-videos.s3.amazonaws.com',

  videos: {
    // 开发环境使用本地文件
    heroBackground: '/front.mp4'
  },

  images: {
    heroFallback: 'https://images.unsplash.com/photo-1587351021759-3e566b3db4f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  }
};

// 导出当前环境的配置
export const mediaConfig = isProduction ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;

// 辅助函数：获取优化的视频URL
export const getVideoUrl = (videoKey: keyof typeof mediaConfig.videos): string => {
  return mediaConfig.videos[videoKey];
};

// 辅助函数：获取图片URL
export const getImageUrl = (imageKey: keyof typeof mediaConfig.images): string => {
  return mediaConfig.images[imageKey];
};

// 视频优化建议的格式和参数
export const VIDEO_OPTIMIZATION = {
  formats: ['mp4', 'webm'], // 现代浏览器支持
  qualities: {
    mobile: '720p',
    desktop: '1080p',
    large: '1440p'
  },
  compression: {
    crf: 28, // 较高压缩率，保持质量
    preset: 'slow' // 更好的压缩效率
  }
} as const;
