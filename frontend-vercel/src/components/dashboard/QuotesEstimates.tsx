
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Eye, CheckCircle } from "lucide-react";
import { apiService, DashboardData } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const QuotesEstimates = () => {
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
    return <div>{t('quotes.loginToView')}</div>;
  }

  // Function to determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Sent": return "text-blue-600 bg-blue-50";
      case "Draft": return "text-gray-600 bg-gray-50";
      case "Accepted": return "text-green-600 bg-green-50";
      case "Expired": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  // Function to determine which action buttons to show based on status
  const getActionButtons = (status: string) => {
    switch (status) {
      case "Sent":
        return (
          <>
            <Button variant="outline" size="sm" className="mr-2">
              <Eye className="h-4 w-4 mr-1" /> {t('dashboard.view')}
            </Button>
            <Button variant="outline" size="sm">
              <CheckCircle className="h-4 w-4 mr-1" /> {t('quotes.accept')}
            </Button>
          </>
        );
      case "Draft":
        return (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" /> {t('dashboard.view')}
          </Button>
        );
      case "Accepted":
      case "Expired":
        return (
          <>
            <Button variant="outline" size="sm" className="mr-2">
              <Eye className="h-4 w-4 mr-1" /> {t('dashboard.view')}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> {t('quotes.pdf')}
            </Button>
          </>
        );
      default:
        return (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" /> {t('dashboard.view')}
          </Button>
        );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('quotes.title')}</h2>
        <Button className="bg-mintGreen hover:bg-mintGreen/90">{t('quotes.requestNew')}</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('quotes.quoteId')}</TableHead>
              <TableHead>{t('quotes.procedure')}</TableHead>
              <TableHead>{t('quotes.status')}</TableHead>
              <TableHead>{t('quotes.created')}</TableHead>
              <TableHead>{t('quotes.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashboardData.quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell className="font-medium">{quote.quote_id}</TableCell>
                <TableCell>
                  <div className="font-medium">{quote.disease.name}</div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                    {quote.status}
                  </span>
                </TableCell>
                <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{getActionButtons(quote.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default QuotesEstimates;
