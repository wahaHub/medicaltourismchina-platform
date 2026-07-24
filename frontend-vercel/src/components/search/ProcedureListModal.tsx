import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProcedureCard } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLowResImageUrl, getProgressiveBaseFromUrl } from '@/utils/imageUrl';
import { getProcedurePath } from '@/utils/procedure-path';
import ProgressiveImage from '@/components/ProgressiveImage';
import { LOW_MEDIA_BASE_URL } from "@/config/media";

const SURGERY_PLACEHOLDER_URL = `${LOW_MEDIA_BASE_URL}/root_assets/surgery_placeholder_x2.png`;

interface ProcedureListModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedures: ProcedureCard[];
  loading: boolean;
  diseaseName: string;
}

export default function ProcedureListModal({
  isOpen,
  onClose,
  procedures,
  loading,
  diseaseName,
}: ProcedureListModalProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  console.log('[ProcedureListModal] Render:', { isOpen, proceduresCount: procedures.length, loading, diseaseName });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          console.log('[ProcedureListModal] Backdrop clicked');
          onClose();
        }}
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-h-[85vh] bg-white rounded-t-2xl shadow-2xl animate-slide-up overflow-hidden z-10"
        onClick={(e) => {
          console.log('[ProcedureListModal] Modal content clicked - event stopped');
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b bg-emerald-50/70">
          <h3 className="text-base font-semibold text-emerald-800 line-clamp-1 flex-1">
            {diseaseName ? `${diseaseName} - 治疗方案` : '相关手术'}
          </h3>
          <button
            onClick={(e) => {
              console.log('[ProcedureListModal] Close button clicked');
              e.stopPropagation();
              onClose();
            }}
            className="flex-shrink-0 p-1 rounded-full hover:bg-emerald-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-56px)] p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">加载中...</p>
            </div>
          ) : procedures.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm">暂无相关手术</p>
            </div>
          ) : (
            <div className="space-y-3">
              {procedures.map((procedure) => {
                console.log('[ProcedureListModal] Rendering procedure:', procedure.slug);
                return (
                  <div
                    key={procedure.id}
                    className="bg-[#f2f7f8] rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all"
                  >
                    {/* Image */}
                    <div
                      className="w-full h-32 rounded-md overflow-hidden bg-gray-100 mb-3 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('[ProcedureListModal] Image clicked:', procedure.slug);
                        const targetUrl = getProcedurePath(procedure.slug);
                        console.log('[ProcedureListModal] Navigating to:', targetUrl);
                        // Directly navigate, modal will naturally close when page changes
                        navigate(targetUrl);
                      }}
                    >
                      {getProgressiveBaseFromUrl((procedure as any).image_url) ? (
                        <ProgressiveImage
                          baseUrl={getProgressiveBaseFromUrl((procedure as any).image_url)!}
                          alt={procedure.name}
                          resolutionLevels={['x1', 'x2']}
                          fallbackUrl={SURGERY_PLACEHOLDER_URL}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <img
                          src={getLowResImageUrl((procedure as any).image_url) || SURGERY_PLACEHOLDER_URL}
                          alt={procedure.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>

                  {/* Title */}
                  <h4
                    className="text-base font-semibold text-gray-900 mb-1 cursor-pointer hover:text-[rgb(149,196,182)] transition-colors line-clamp-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('[ProcedureListModal] Title clicked:', procedure.slug);
                      const targetUrl = getProcedurePath(procedure.slug);
                      console.log('[ProcedureListModal] Navigating to:', targetUrl);
                      navigate(targetUrl);
                    }}
                  >
                    {procedure.name}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {(procedure as any).summary || (procedure as any).description || 'Professional medical procedure'}
                  </p>

                  {/* Info Row */}
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="text-emerald-600 font-medium">
                      {(procedure as any).waiting_time || (procedure as any).avg_wait_days || '3-5 days'}
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      {typeof (procedure as any).cost_usd === 'string'
                        ? (procedure as any).cost_usd
                        : (procedure as any).cost_usd
                        ? `$${(procedure as any).cost_usd.toLocaleString()}`
                        : '$28,000'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('[ProcedureListModal] Start booking button clicked:', procedure.slug);
                        const targetUrl = `/hospitals?procedure=${procedure.slug}`;
                        console.log('[ProcedureListModal] Navigating to:', targetUrl);
                        navigate(targetUrl);
                      }}
                      className="flex-1 px-3 py-2 bg-[#94c5b8] text-white text-sm font-medium rounded-md hover:bg-[#7fb5a4] transition-colors"
                    >
                      开始预约
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('[ProcedureListModal] More details button clicked:', procedure.slug);
                        const targetUrl = getProcedurePath(procedure.slug);
                        console.log('[ProcedureListModal] Navigating to:', targetUrl);
                        navigate(targetUrl);
                      }}
                      className="flex-1 px-3 py-2 bg-[#394150] text-white text-sm font-medium rounded-md hover:bg-[#2d3340] transition-colors"
                    >
                      详细信息
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
