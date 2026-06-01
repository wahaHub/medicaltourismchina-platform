import { mediaConfig } from '@/config/media';

/**
 * 获取图片的完整URL
 * 在生产环境中使用CloudFront CDN，开发环境中使用本地路径
 * @param imagePath 图片路径，可以是相对路径或绝对路径
 * @returns 完整的图片URL
 */
export const getImageUrl = (imagePath: string): string => {
  // 如果已经是完整URL，直接返回
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // 移除开头的斜杠并清理路径
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // 如果是生产环境且有CDN配置，使用CloudFront
  if (mediaConfig.cdnBaseUrl) {
    return `${mediaConfig.cdnBaseUrl}/${cleanPath}`;
  }
  
  // 开发环境使用本地路径
  return imagePath;
};

/**
 * 获取多个图片URL的辅助函数
 * @param imagePaths 图片路径数组
 * @returns 完整URL数组
 */
export const getImageUrls = (imagePaths: string[]): string[] => {
  return imagePaths.map(getImageUrl);
};

const PUBLIC_MEDIA_BASE_URL = (
  import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL
  || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev'
).replace(/\/+$/, '');
const LOW_ASSET_BASE = `${PUBLIC_MEDIA_BASE_URL}/low`;
const KNOWN_DOMAINS = ['www.medicaltourismchina.health', 'medicaltourismchina.health'];
const LEGACY_LOW_DOMAINS = [
  ['d1wwcixye6at8o', 'cloudfront.net'].join('.'),
  ['medchina-cloudfront', 's3.amazonaws.com'].join('.'),
];
const LEGACY_LOW_SEGMENT = ['low', 'resolution'].join('_');

/**
 * Resolution suffix types for progressive image loading
 */
export type ResolutionSuffix = 'x1' | 'x2' | 'x3';

/**
 * Get the base URL for progressive low images (without the _x1/_x2/_x3 suffix)
 * Use this with ProgressiveImage component
 *
 * @param folder - The folder name (e.g., 'disease', 'department', 'homepage/medical_journey')
 * @param id - The image ID (e.g., 'abc-123-def')
 * @returns Base URL without extension.
 */
export const getProgressiveImageBaseUrl = (folder: string, id: string): string => {
  return `${LOW_ASSET_BASE}/${folder}/${id}`;
};

/**
 * Get a specific resolution URL for progressive low images.
 *
 * @param folder - The folder name (e.g., 'disease', 'department')
 * @param id - The image ID
 * @param resolution - Resolution suffix ('x1', 'x2', or 'x3')
 * @param extension - File extension (default: '.png')
 * @returns Full URL with resolution suffix
 */
export const getResolutionImageUrl = (
  folder: string,
  id: string,
  resolution: ResolutionSuffix = 'x2',
  extension: string = '.png'
): string => {
  return `${LOW_ASSET_BASE}/${folder}/${id}_${resolution}${extension}`;
};

/**
 * Get multiple resolution URLs for fallback chain
 * Returns URLs in order from lowest to highest resolution
 *
 * @param folder - The folder name
 * @param id - The image ID
 * @param extension - File extension (default: '.png')
 * @returns Array of URLs [x1, x2, x3]
 */
export const getMultiResolutionUrls = (
  folder: string,
  id: string,
  extension: string = '.png'
): { x1: string; x2: string; x3: string; base: string } => {
  const base = `${LOW_ASSET_BASE}/${folder}/${id}`;
  return {
    base,
    x1: `${base}_x1${extension}`,
    x2: `${base}_x2${extension}`,
    x3: `${base}_x3${extension}`,
  };
};

/**
 * Disease image URL helpers
 */
export const getDiseaseProgressiveUrl = (id: string) => getProgressiveImageBaseUrl('disease', id);
export const getDiseaseResolutionUrl = (id: string, res: ResolutionSuffix = 'x2') =>
  getResolutionImageUrl('disease', id, res);
export const getDiseaseMultiResUrls = (id: string) => getMultiResolutionUrls('disease', id);

/**
 * Department image URL helpers
 */
export const getDepartmentProgressiveUrl = (id: string) => getProgressiveImageBaseUrl('department', id);
export const getDepartmentResolutionUrl = (id: string, res: ResolutionSuffix = 'x2') =>
  getResolutionImageUrl('department', id, res);
export const getDepartmentMultiResUrls = (id: string) => getMultiResolutionUrls('department', id);

/**
 * Homepage medical journey image URL helpers
 */
export const getMedicalJourneyProgressiveUrl = (name: string) =>
  getProgressiveImageBaseUrl('homepage/medical_journey', name);
export const getMedicalJourneyResolutionUrl = (name: string, res: ResolutionSuffix = 'x2') =>
  getResolutionImageUrl('homepage/medical_journey', name, res);

/**
 * Procedure/Surgery image URL helpers
 * These handle surgery-illustrations and recovery-illustrations folders
 */
export const getSurgeryIllustrationProgressiveUrl = (id: string) =>
  getProgressiveImageBaseUrl('surgery-illustrations', id);
export const getSurgeryIllustrationResolutionUrl = (id: string, res: ResolutionSuffix = 'x2') =>
  getResolutionImageUrl('surgery-illustrations', id, res);
export const getRecoveryIllustrationProgressiveUrl = (id: string) =>
  getProgressiveImageBaseUrl('recovery-illustrations', id);
export const getRecoveryIllustrationResolutionUrl = (id: string, res: ResolutionSuffix = 'x2') =>
  getResolutionImageUrl('recovery-illustrations', id, res);

/**
 * Convert an image URL to a progressive base URL (without _x1/_x2 suffix)
 * This handles various folder structures and returns the base for progressive loading
 *
 * @param imageUrl Original image URL
 * @returns Base URL suitable for ProgressiveImage component
 */
export const getProgressiveBaseFromUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;

  // Folders that support progressive loading
  const progressiveFolders = [
    'disease-illustrations',
    'surgery-illustrations',
    'recovery-illustrations',
    'disease'
  ];

  try {
    const url = new URL(imageUrl);

    const pathParts = url.pathname.split('/');

    // Check if this is a folder that supports progressive loading
    for (const folder of progressiveFolders) {
      const folderIndex = pathParts.indexOf(folder);
      if (folderIndex > 0) {
        // Remove file extension and any existing _x1/_x2/_x3 suffix
        const lastPart = pathParts[pathParts.length - 1];
        const cleanName = lastPart
          .replace(/\.(png|jpg|jpeg|webp|gif)$/i, '')
          .replace(/_x[123]$/, '');
        return `${LOW_ASSET_BASE}/${folder}/${cleanName}`;
      }
    }

    // Not a progressive folder, return null
    return null;
  } catch {
    return null;
  }
};

/**
 * 将旧 CDN 图片 URL 转换为 R2 low 版本
 * 同时将非CDN域名转换为CloudFront CDN域名
 * 例如: https://www.medicaltourismchina.health/disease-illustrations/abc.png
 *    -> R2 /low/disease-illustrations/abc.png
 * @param imageUrl 原始图片URL
 * @returns 低分辨率版本的URL
 */
export const getLowResImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;

  // 需要转换的文件夹列表
  const foldersToConvert = [
    'disease-illustrations',
    'surgery-illustrations',
    'recovery-illustrations',
    'disease'
  ];

  try {
    const url = new URL(imageUrl);

    const pathParts = url.pathname.split('/');

    const legacyLowIndex = pathParts.indexOf(LEGACY_LOW_SEGMENT);
    if (legacyLowIndex > 0 && LEGACY_LOW_DOMAINS.includes(url.hostname)) {
      const r2Path = pathParts.slice(legacyLowIndex + 1).join('/');
      return `${LOW_ASSET_BASE}/${r2Path}`;
    }

    // 检查路径中是否包含需要转换的文件夹
    for (const folder of foldersToConvert) {
      const folderIndex = pathParts.indexOf(folder);
      if (folderIndex > 0) {
        const r2Path = pathParts.slice(folderIndex).join('/');
        return `${LOW_ASSET_BASE}/${r2Path}`;
      }
    }

    if (KNOWN_DOMAINS.includes(url.hostname) || LEGACY_LOW_DOMAINS.includes(url.hostname)) {
      return url.toString();
    }

    return url.toString();
  } catch {
    return imageUrl;
  }
};

/**
 * 获取兼容图片 URL。
 * 旧 low CDN URL 会映射到 R2 /low。
 * @param imageUrl 图片URL（可能是低分辨率或高分辨率）
 * @returns 高分辨率版本的URL
 */
export const getHighResImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;

  try {
    const url = new URL(imageUrl);

    const pathParts = url.pathname.split('/');

    const lowResIndex = pathParts.indexOf(LEGACY_LOW_SEGMENT);
    if (lowResIndex > 0) {
      const r2Path = pathParts.slice(lowResIndex + 1).join('/');
      return `${LOW_ASSET_BASE}/${r2Path}`;
    }

    return url.toString();
  } catch {
    return imageUrl;
  }
};

/**
 * 预设的图片路径常量
 * 方便管理和维护图片路径
 */
export const IMAGE_PATHS = {
  // Packages页面步骤图片
  packages: {
    step1: '/icons_packages_page/step1@2x.png',
    step2: '/icons_packages_page/step2@2x.png',
    step3: '/icons_packages_page/step3@2x.png',
    step4: '/icons_packages_page/step4@2x.png',
    step5: '/icons_packages_page/step5@2x.png',
    step6: '/icons_packages_page/step6@2x.png',
  },
  
  // 首页图标
  homeIcons: {
    costEffective: '/icons_home_page/Cost-Effective Excellence@2x.png',
    superiorQuality: '/icons_home_page/Superior Quality@2x.png',
    cuttingEdge: '/icons_home_page/Cutting-Edge Technology@2x.png',
    specializedExpertise: '/icons_home_page/Specialized Expertise@2x.png',
    searchHospitals: '/icons_home_page/Search for Hospitals@2x.png',
    bookJourney: '/icons_home_page/Book Your Medical Journey 2X.png',
    handleRest: '/icons_home_page/We Handle the Rest@2x.png',
    visaFree: '/icons_home_page/Visa-Free Access@2x.png',
    conciergeService: '/icons_home_page/Concierge Service@2x.png',
    luxuryAccommodations: '/icons_home_page/Luxury Accommodations@2x.png',
    medicalEscort: '/icons_home_page/Medical Escort@2x.png',
    privateTransportation: '/icons_home_page/Private Transportation@2x.png',
    translationServices: '/icons_home_page/Translation Services@2x.png',
  },
  
  // 治疗图片
  treatments: {
    cartTherapy: '/treatment/CarT.png',
    dbs: '/treatment/DBS.png',
    emr: '/treatment/EMR.png',
    esd: '/treatment/ESD.png',
    peld: '/treatment/PELD.png',
    poem: '/treatment/POEM.png',
    sbrt: '/treatment/SBRT.png',
    ube: '/treatment/UBE.png',
    // 可以继续添加更多治疗图片
  },
  
  // 搜索页面图片
  search: {
    whyChina1: `${LOW_ASSET_BASE}/root_assets/search_why_china1_x2.png`,
    whyChina2: `${LOW_ASSET_BASE}/root_assets/search_why_china2_x2.png`,
    whyChina3: `${LOW_ASSET_BASE}/root_assets/search_why_china3_x2.png`,
    whyChina4: `${LOW_ASSET_BASE}/root_assets/search_why_china4_x2.png`,
    whyChina5: `${LOW_ASSET_BASE}/root_assets/search_why_china5_x2.png`,
  },
  
  // 搜索页面顶部背景图（18张）
  searchTopbar: {
    1: `${LOW_ASSET_BASE}/search_topbar/1_x2.png`,
    2: `${LOW_ASSET_BASE}/search_topbar/2_x2.png`,
    3: `${LOW_ASSET_BASE}/search_topbar/3_x2.png`,
    4: `${LOW_ASSET_BASE}/search_topbar/4_x2.png`,
    5: `${LOW_ASSET_BASE}/search_topbar/5_x2.png`,
    6: `${LOW_ASSET_BASE}/search_topbar/6_x2.png`,
    7: `${LOW_ASSET_BASE}/search_topbar/7_x2.png`,
    8: `${LOW_ASSET_BASE}/search_topbar/8_x2.png`,
    9: `${LOW_ASSET_BASE}/search_topbar/9_x2.png`,
    10: `${LOW_ASSET_BASE}/search_topbar/10_x2.png`,
    11: `${LOW_ASSET_BASE}/search_topbar/11_x2.png`,
    12: `${LOW_ASSET_BASE}/search_topbar/12_x2.png`,
    13: `${LOW_ASSET_BASE}/search_topbar/13_x2.png`,
    14: `${LOW_ASSET_BASE}/search_topbar/14_x2.png`,
    15: `${LOW_ASSET_BASE}/search_topbar/15_x2.png`,
    16: `${LOW_ASSET_BASE}/search_topbar/16_x2.png`,
    17: `${LOW_ASSET_BASE}/search_topbar/17_x2.png`,
    18: `${LOW_ASSET_BASE}/search_topbar/18_x2.png`,
  },
  
  // 服务流程图片 - progressive loading base URLs (without _x1/_x2 suffix)
  serviceProcess: {
    step1: `${LOW_ASSET_BASE}/our_service_process/proc_service_1`,
    step2: `${LOW_ASSET_BASE}/our_service_process/proc_service_2`,
    step3: `${LOW_ASSET_BASE}/our_service_process/proc_service_3`,
    step4: `${LOW_ASSET_BASE}/our_service_process/proc_service_4`,
    step5: `${LOW_ASSET_BASE}/our_service_process/proc_service_5`,
  },
  
  // 手术详情页面图片
  procedureDetail: {
    comma: `${LOW_ASSET_BASE}/root_assets/comma_x2.png`,
    halfmoon: `${LOW_ASSET_BASE}/root_assets/halfmoon_x2.png`,
    stepBackground: `${LOW_ASSET_BASE}/root_assets/step_background_x2.png`,
    surgeryPlaceholder: `${LOW_ASSET_BASE}/root_assets/surgery_placeholder_x2.png`,
    recoveryPlaceholder: `${LOW_ASSET_BASE}/root_assets/recovery_placeholder_x2.png`,
    medicalEscort: `${LOW_ASSET_BASE}/icons_home_page/Medical Escort_x2.png`,
  },
  
  // Logo和品牌图片
  branding: {
    logo: `${LOW_ASSET_BASE}/Medora%20Health-logo/logo_x1.png`,
    medoraLogo: `${LOW_ASSET_BASE}/Medora%20Health-logo/logo-1_x1.png`,
  }
} as const;
