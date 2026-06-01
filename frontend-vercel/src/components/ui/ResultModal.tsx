import React from 'react';
import { CheckCircle, XCircle, ClipboardList, ArrowRight, Home, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title?: string;
  message?: string;
  // Success specific props
  accountCreated?: boolean;
  showCaseIntakeCTA?: boolean;
  // Error specific props
  errorDetails?: string;
  onRetry?: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  accountCreated = false,
  showCaseIntakeCTA = true,
  errorDetails,
  onRetry,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  const handleGoToCaseIntake = () => {
    onClose();
    navigate('/medical-case-intake');
  };

  const handleRetry = () => {
    onClose();
    onRetry?.();
  };

  if (type === 'success') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-6 w-6" />
              {title || t('resultModal.success.title') || 'Request Submitted Successfully!'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              {message || t('resultModal.success.message') || 'Thank you for your submission. Our medical team will review your request and contact you within 24-48 hours.'}
            </p>

            {accountCreated && (
              <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                {t('resultModal.success.accountCreated') || 'Your account has been created. You can now log in to track your request status.'}
              </p>
            )}

            {/* Case Intake CTA */}
            {showCaseIntakeCTA && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {t('resultModal.caseIntake.title') || 'Complete Your Medical Case Form'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {t('resultModal.caseIntake.description') || 'For faster processing and more accurate recommendations, please complete our detailed medical case intake form.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleGoToCaseIntake}
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {t('resultModal.caseIntake.linkText') || 'Complete Medical Form'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleGoHome}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                {t('resultModal.success.backToHome') || 'Back to Home'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error Modal
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-red-600">
            <XCircle className="h-6 w-6" />
            {title || t('resultModal.error.title') || 'Submission Failed'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-600">
            {message || t('resultModal.error.message') || 'We encountered an error while processing your request. Please try again.'}
          </p>

          {errorDetails && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-medium mb-1">
                {t('resultModal.error.details') || 'Error Details:'}
              </p>
              <p className="text-sm text-red-600">{errorDetails}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              {t('resultModal.error.contactUs') || 'If the problem persists, please contact us:'}
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-sm">
                <span className="font-medium">Email:</span>{' '}
                <a href="mailto:contact@medicaltourismchina.health" className="text-blue-600 hover:underline">
                  contact@medicaltourismchina.health
                </a>
              </p>
              <p className="text-sm">
                <span className="font-medium">WhatsApp:</span>{' '}
                <a href="https://wa.me/14708613825" className="text-blue-600 hover:underline">
                  (+1) 470-861-3825
                </a>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleGoHome}
            >
              {t('resultModal.error.backToHome') || 'Back to Home'}
            </Button>
            {onRetry && (
              <Button
                onClick={handleRetry}
                className="gap-2 bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4" />
                {t('resultModal.error.tryAgain') || 'Try Again'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultModal;
