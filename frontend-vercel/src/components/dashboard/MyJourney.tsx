
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock, Plane, Ambulance, Hospital, Video } from "lucide-react";
import { apiService, DashboardData } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const MyJourney = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (authLoading) return;
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getDashboardData(user.id);
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, isAuthenticated, authLoading]);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'check': return Check;
      case 'video': return Video;
      case 'plane': return Plane;
      case 'ambulance': return Ambulance;
      case 'hospital': return Hospital;
      default: return Clock;
    }
  };

  if (authLoading || loading) {
    return <div>{t('dashboard.loading')}</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>{t('journey.loginToView')}</div>;
  }

  if (!dashboardData) {
    return <div>{t('journey.noData')}</div>;
  }

  const activeJourney = dashboardData.medical_journeys[0]; // Get first journey
  if (!activeJourney) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">{t('journey.title')}</h2>
        <p className="text-gray-500">{t('journey.noActive')}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('journey.title')}</h2>
      
              <div className="bg-white rounded-lg shadow p-6">
          <div className="relative">
            {activeJourney.stages.map((stage, index) => (
              <div key={stage.id} className="relative mb-12 pl-12">
                {/* Timeline connector line */}
                {index < activeJourney.stages.length - 1 && (
                                  <div className={`absolute left-6 top-6 w-0.5 h-full bg-gray-200 -z-10 ${stage.status === 'completed' ? 'bg-mintGreen' : ''}`} />
                )}
                
                {/* Stage icon */}
                <div className={`absolute left-0 top-0 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  stage.status === 'completed' ? 'bg-mintGreen text-white border-mintGreen' : 'bg-white text-gray-400 border-gray-200'
                }`}>
                  {React.createElement(getIconComponent(stage.icon), { className: "h-5 w-5" })}
                </div>
                
                {/* Stage content */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{stage.stage_name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      stage.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {stage.status === 'completed' ? t('journey.completed') : t('journey.upcoming')}
                    </span>
                  </div>
                  <p className="text-gray-500">{stage.start_date}</p>
                  <p className="mt-1">{stage.notes}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  {t('journey.viewDetails')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyJourney;
