
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, FileText, Route, ClipboardList, AlertCircle, Clock, CheckCircle2, Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { apiService, DashboardData } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { CaseIntake } from "@/types/caseIntake";

interface DashboardHomeProps {
  onNavigateToTab?: (tabName: string) => void;
}

// Helper component for case intake status badge
const CaseIntakeStatusBadge = ({ status, isZh }: { status: string; isZh: boolean }) => {
  const statusConfig: Record<string, { label: string; labelZh: string; className: string }> = {
    draft: { label: 'Draft', labelZh: '草稿', className: 'bg-orange-100 text-orange-700 border-orange-200' },
    submitted: { label: 'Submitted', labelZh: '已提交', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    under_review: { label: 'Under Review', labelZh: '审核中', className: 'bg-purple-100 text-purple-700 border-purple-200' },
    archived: { label: 'Archived', labelZh: '已归档', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  };
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <Badge variant="outline" className={`text-xs ${config.className}`}>
      {status === 'submitted' && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {isZh ? config.labelZh : config.label}
    </Badge>
  );
};

// Helper function to get category label
const getCategoryLabel = (category: string, isZh: boolean): string => {
  const categoryLabels: Record<string, { en: string; zh: string }> = {
    surgery: { en: 'Surgery', zh: '外科手术' },
    tumor: { en: 'Tumor/Cancer', zh: '肿瘤' },
    fertility: { en: 'Fertility', zh: '生育' },
    cosmetic: { en: 'Cosmetic', zh: '美容整形' },
    cardiovascular: { en: 'Cardiovascular', zh: '心血管' },
    general: { en: 'General', zh: '综合' },
    other: { en: 'Other', zh: '其他' },
  };
  const labels = categoryLabels[category] || categoryLabels.other;
  return isZh ? labels.zh : labels.en;
};

const DashboardHome = ({ onNavigateToTab }: DashboardHomeProps) => {
  const { t, currentLanguage } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const isZh = String(currentLanguage) === 'zh';
  
  // Get current date to display
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  useEffect(() => {
    const loadDashboardData = async () => {
      // Wait for authentication to complete
      if (authLoading) return;
      
      // If not authenticated, don't try to load dashboard data
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

  // Show loading while auth is loading or dashboard data is loading
  if (authLoading || loading) {
    return <div>{t('dashboard.loading')}</div>;
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.pleaseLogin')}</h2>
        <p className="text-gray-600 mb-4">{t('dashboard.loginRequired')}</p>
        <Button onClick={() => window.location.href = '/auth'} className="bg-mintGreen hover:bg-mintGreen/90">
          {t('dashboard.loginButton')}
        </Button>
      </div>
    );
  }

  // Show message if no dashboard data
  if (!dashboardData) {
    return <div>{t('dashboard.noData')}</div>;
  }

  // Determine display name priority: name > email > phone > honored user
  const fullName = [dashboardData.first_name, dashboardData.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();
  const displayName = fullName || dashboardData.email || dashboardData.phone || t('common.honoredUser');

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('dashboard.welcomeBack', { name: displayName })}</h1>
        <p className="text-gray-500">{formattedDate}</p>
      </div>

      {/* Case Intake CTA Card */}
      <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <ClipboardList className="h-6 w-6 text-blue-600" />
            <span>{t('caseIntake.dashboard.title')}</span>
            {dashboardData.case_intakes_count > 0 && (
              <Badge variant="secondary" className="ml-2">
                {dashboardData.case_intakes_count} {isZh ? '份' : 'case(s)'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            {t('caseIntake.dashboard.description')}
          </p>

          {/* Show draft alert if user has an active draft */}
          {dashboardData.has_active_draft && dashboardData.latest_draft && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 flex items-center justify-between">
                <span>{t('caseIntake.dashboard.draftAlert')}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-4 border-yellow-400 text-yellow-700 hover:bg-yellow-100"
                  onClick={() => navigate(`/medical-case-intake?resume=${dashboardData.latest_draft?.id}`)}
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  {isZh ? '继续填写' : 'Continue'}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/medical-case-intake')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              {t('caseIntake.dashboard.startButton')}
            </Button>

            {/* Show view submitted button if user has submitted cases */}
            {dashboardData.submitted_case_intakes_count > 0 && (
              <Button
                variant="outline"
                onClick={() => onNavigateToTab?.('dashboard.caseIntakes')}
              >
                {t('caseIntake.dashboard.viewSubmitted')} ({dashboardData.submitted_case_intakes_count})
              </Button>
            )}
          </div>

          <p className="text-sm text-gray-500">
            {t('caseIntake.dashboard.timeEstimate')}
          </p>
        </CardContent>
      </Card>

      {/* Display User's Case Intakes List */}
      {dashboardData.case_intakes && dashboardData.case_intakes.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-mintGreen" />
              {isZh ? '我的医疗病例' : 'My Medical Cases'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.case_intakes.map((caseIntake: CaseIntake) => (
                <div
                  key={caseIntake.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {caseIntake.chief_complaint || caseIntake.form_data?.step2?.chief_complaint || (isZh ? '医疗病例' : 'Medical Case')}
                      </span>
                      <CaseIntakeStatusBadge status={caseIntake.status} isZh={isZh} />
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(caseIntake.updated_at).toLocaleDateString(isZh ? 'zh-CN' : 'en-US')}
                      </span>
                      {caseIntake.main_category && (
                        <span className="text-gray-400">
                          {getCategoryLabel(caseIntake.main_category, isZh)}
                        </span>
                      )}
                      {caseIntake.status === 'draft' && (
                        <span className="text-orange-500">
                          {isZh ? `步骤 ${caseIntake.current_step}/7` : `Step ${caseIntake.current_step}/7`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {caseIntake.status === 'draft' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/medical-case-intake?resume=${caseIntake.id}`)}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        {isZh ? '继续' : 'Continue'}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/case-intake/${caseIntake.id}`)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {isZh ? '查看' : 'View'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-mintGreen" />
              {t('dashboard.pendingQuotes')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">{dashboardData.pending_quotes_count}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigateToTab?.('dashboard.quotes')}
            >
              {t('dashboard.view')}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-mintGreen" />
              {t('dashboard.upcomingConsultation')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">{dashboardData.upcoming_consultations_count}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigateToTab?.('dashboard.consultation')}
            >
              {t('dashboard.manage')}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Route className="h-5 w-5 text-mintGreen" />
              {t('dashboard.activeJourney')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">{dashboardData.active_journeys_count}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigateToTab?.('dashboard.journey')}
            >
              {t('dashboard.details')}
            </Button>
          </CardContent>
        </Card>
        

      </div>
    </div>
  );
};

export default DashboardHome;
