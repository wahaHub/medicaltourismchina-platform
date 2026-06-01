
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { apiService, DashboardData } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";


const BookConsultation = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [date, setDate] = useState<Date | undefined>(new Date());
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

  if (authLoading || loading) {
    return <div>{t('dashboard.loading')}</div>;
  }

  if (!isAuthenticated || !user || !dashboardData) {
    return <div>{t('consultation.loginToBook')}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('consultation.title')}</h2>
      
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{t('consultation.upcoming')}</h3>
            {dashboardData.consultations.length > 0 ? (
              dashboardData.consultations.map((consultation) => (
                <Card key={consultation.id} className="mb-4">
                  <CardContent className="p-4">
                    <h4 className="font-bold">{t('consultation.bookingRequest')}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(consultation.created_at).toLocaleDateString()} - {consultation.status}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      {consultation.message || t('consultation.noMessage')}
                    </p>
                    <div className="text-sm text-gray-600 mb-3">
                      <p>{t('consultation.age')}: {consultation.age} | {t('consultation.gender')}: {consultation.gender}</p>
                      <p>{t('consultation.country')}: {consultation.country}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">{t('consultation.viewDetails')}</Button>
                      <Button variant="outline" size="sm" className="text-red-500">{t('consultation.cancel')}</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500">{t('consultation.noUpcoming')}</p>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">{t('consultation.calendar')}</h3>
            <Card>
              <CardContent className="p-2">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
};

export default BookConsultation;
