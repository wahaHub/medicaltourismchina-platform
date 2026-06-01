
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, HelpCircle } from "lucide-react";
import { apiService, DashboardData } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const SupportFAQs = () => {
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

  if (!isAuthenticated || !user) {
    return <div>{t('support.loginToAccess')}</div>;
  }

  if (!dashboardData) {
    return <div>{t('support.noData')}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('support.title')}</h2>
      
      <div className="grid md:grid-cols-1 gap-6 mb-8 max-w-md mx-auto">
        <Card className="flex flex-col items-center text-center p-6 hover:shadow-md transition-shadow">
          <MessageSquare className="h-12 w-12 text-mintGreen mb-4" />
          <CardTitle className="mb-2">{t('support.contactCoordinator')}</CardTitle>
          <p className="text-gray-500 mb-4">{t('support.coordinatorDesc')}</p>
          <Button className="bg-mintGreen hover:bg-mintGreen/90 mt-auto">{t('support.startChat')}</Button>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-mintGreen" />
            {t('support.faqs')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Static FAQs for now - could be moved to i18n or API later */}
          {[
            {
              id: 1,
              question: t('support.faq1Question'),
              answer: t('support.faq1Answer')
            },
            {
              id: 2,
              question: t('support.faq2Question'),
              answer: t('support.faq2Answer')
            },
            {
              id: 3,
              question: t('support.faq3Question'),
              answer: t('support.faq3Answer')
            }
          ].map((faq) => (
            <div key={faq.id}>
              <h3 className="font-bold mb-1">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
          
          <div className="text-center mt-6">
            <Button variant="outline">{t('support.viewAllFaqs')}</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('support.submitTicket')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-1">{t('support.subject')}</label>
              <Input id="subject" placeholder={t('support.subjectPlaceholder')} />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">{t('support.message')}</label>
              <Textarea id="message" placeholder={t('support.messagePlaceholder')} className="min-h-[120px]" />
            </div>
            <Button className="bg-mintGreen hover:bg-mintGreen/90">{t('support.submitTicketButton')}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportFAQs;
