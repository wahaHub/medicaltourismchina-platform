
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiService, DashboardData } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";

const ProfileSettings = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState(currentLanguage.code);
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);
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
        const data = response.data;
        setDashboardData(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setPreferredLanguage(data.preferred_language || currentLanguage.code);
        setPreferredCurrency(data.preferred_currency || "USD");
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
    return <div>{t('profile.loginToView')}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('profile.title')}</h2>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.personalInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">{t('profile.email')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">{t('profile.phone')}</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.preferences')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">{t('profile.preferredLanguage')}</Label>
                <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('profile.language.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {`${lang.flag} ${lang.name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="currency">{t('profile.preferredCurrency')}</Label>
                <Select value={preferredCurrency} onValueChange={setPreferredCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('profile.currency.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="CNY">CNY (¥)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              className="bg-mintGreen hover:bg-mintGreen/90 active:scale-95 transition-transform duration-100 focus:outline-none focus:ring-2 focus:ring-mintGreen/50 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={saving}
              onClick={async () => {
                try {
                  setSaving(true);
                  await apiService.updateUserProfile({
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    preferred_language: preferredLanguage,
                    preferred_currency: preferredCurrency,
                  });
                } catch (e) {
                  console.error('Failed to save profile:', e);
                } finally {
                  setSaving(false);
                }
              }}
            >
              {t('profile.saveChanges')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
