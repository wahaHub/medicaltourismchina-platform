import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, MapPin, Monitor, Settings } from 'lucide-react';

const LanguageDetectionIndicator: React.FC = () => {
  const { isLanguageLoading, detectionMethod, currentLanguage, t } = useLanguage();

  // 只在第一次加载时显示检测信息
  if (!isLanguageLoading && detectionMethod === 'saved') {
    return null; // 用户之前已经选择过语言，不显示检测信息
  }

  if (isLanguageLoading) {
    return (
      <Alert className="mb-4 border-blue-200 bg-blue-50">
        <Globe className="h-4 w-4 animate-spin" />
        <AlertDescription className="text-blue-800">
          {t('languageDetection.detecting')}
        </AlertDescription>
      </Alert>
    );
  }

  // 显示检测结果
  const getDetectionIcon = () => {
    switch (detectionMethod) {
      case 'geolocation':
        return <MapPin className="h-4 w-4" />;
      case 'browser':
        return <Monitor className="h-4 w-4" />;
      case 'default':
        return <Settings className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getDetectionMessage = () => {
    switch (detectionMethod) {
      case 'geolocation':
        return t('languageDetection.detectedByLocation', { language: currentLanguage.name });
      case 'browser':
        return t('languageDetection.detectedByBrowser', { language: currentLanguage.name });
      case 'default':
        return t('languageDetection.usingDefault', { language: currentLanguage.name });
      default:
        return t('languageDetection.languageSet', { language: currentLanguage.name });
    }
  };

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      {getDetectionIcon()}
      <AlertDescription className="text-green-800">
        {getDetectionMessage()}
      </AlertDescription>
    </Alert>
  );
};

export default LanguageDetectionIndicator;
