import { Link } from 'react-router-dom';
import { Clock, DollarSign } from 'lucide-react';
import type { ProcedureCard as ProcedureCardType } from '@/types';
import { getProcedurePath } from '@/utils/procedure-path';

interface ProcedureCardProps {
  procedure: ProcedureCardType;
  onClick?: () => void;
}

const ProcedureCard = ({
  procedure,
  onClick
}: ProcedureCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const minPrice = procedure.price_min || 22000;
  const maxPrice = procedure.price_max || 65000;
  const waitDays = procedure.avg_wait_days || '3-5';

  return (
    <div 
      className="bg-gray-50 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <img 
          src={procedure.image_url || '/images/default-procedure.jpg'} 
          alt={procedure.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3">{procedure.name}</h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {procedure.summary || procedure.description}
        </p>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>等待时间: {waitDays} 天</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>{formatPrice(minPrice)} - {formatPrice(maxPrice)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Link to={getProcedurePath(procedure.slug)}>
            <button 
              className="w-full bg-primaryGreen text-white py-3 rounded-lg font-medium hover:bg-primaryGreen/90 transition-colors"
            >
              开始预约医院
            </button>
          </Link>
          
          <Link to={getProcedurePath(procedure.slug)}>
            <button 
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              查看详情
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProcedureCard;
