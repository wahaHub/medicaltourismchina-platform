
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { apiService, DashboardData } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";


const AccountSecurity = () => {
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

  if (authLoading || loading) {
    return <div>{t('dashboard.loading')}</div>;
  }

  if (!isAuthenticated || !user || !dashboardData) {
    return <div>{t('security.loginToView')}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('security.title')}</h2>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('security.loginCredentials')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">{t('security.emailAddress')}</Label>
              <div className="flex items-center gap-4">
                <Input id="email" value={dashboardData.email} disabled className="flex-1" />
                <Button variant="outline">{t('security.changeEmail')}</Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="password">{t('security.password')}</Label>
              <div className="flex items-center gap-4">
                <Input id="password" value="••••••••••••" type="password" disabled className="flex-1" />
                <Button variant="outline">{t('security.changePassword')}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        

      </div>
    </div>
  );
};

export default AccountSecurity;
