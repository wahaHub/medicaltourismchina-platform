import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { apiService } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";

const FeaturedTreatmentDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getApiLocale, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleFeaturedTreatmentRedirection = async () => {
      if (!slug) {
        setError('Invalid featured treatment URL');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Ask backend to resolve; allow following redirect and detect final URL
        const locale = getApiLocale();
        const apiBase = (await import('@/services/api/config')).API_BASE_URL;
        const resp = await fetch(`${apiBase}/featured-treatments/${slug}?locale=${locale}&no302=1`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          redirect: 'follow',
        });

        // If backend redirected to the procedure endpoint, the final URL will include /procedures/
        const finalUrl = resp.url || '';
        const procMatch = finalUrl.match(/\/procedures\/([^?]+)/);
        if (procMatch && procMatch[1]) {
          navigate(`/procedures/${decodeURIComponent(procMatch[1])}`, { replace: true });
          return;
        }

        // Otherwise parse JSON; backend returns redirect_url when no302=1
        if (resp.ok) {
          const data = await resp.json().catch(() => null);
          const url = data?.redirect_url as string | undefined;
          if (url && url.startsWith('/procedures/')) {
            navigate(url, { replace: true });
            return;
          }
          // No redirect available; display fallback message
          setError(t('featured.loadError'));
          setLoading(false);
          return;
        }

        // Non-OK and no redirect
        setError(t('featured.loadError'));
        setLoading(false);
      } catch (err) {
        console.error('Error redirecting featured treatment:', err);
        setError(t('featured.loadError'));
        setLoading(false);
      }
    };

    handleFeaturedTreatmentRedirection();
  }, [slug, navigate, t, getApiLocale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-64 mb-4 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <p className="mt-4 text-gray-600">{t('featured.redirecting')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <button 
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800"
            >
              {t('common.backToHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null; // Should not reach here
};

export default FeaturedTreatmentDetail;
