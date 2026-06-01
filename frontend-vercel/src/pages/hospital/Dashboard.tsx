/**
 * Hospital Dashboard - 仪表盘
 * 
 * 显示：
 * - 待处理病例
 * - 未读消息
 * - 今日/本周预约
 * - 快捷动作
 */

import { useState } from 'react';
import { HospitalLayout } from '@/components/hospital/HospitalLayout';
import { BatchUploadModal } from '@/components/hospital/BatchUploadModal';
import { useServiceRequests, useAppointments, useCommunications } from '@/hooks/hospital/useMedplumResources';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FolderOpen,
  MessageSquare,
  Calendar,
  Upload,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function HospitalDashboard() {
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false);

  // 获取最近 7 天的病例
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - 7);
  
  const { data: casesData, isLoading: casesLoading } = useServiceRequests({
    dateFrom: dateFrom.toISOString().split('T')[0],
    limit: 10,
  });

  // 获取今日到本周的预约
  const today = new Date().toISOString().split('T')[0];
  const weekLater = new Date();
  weekLater.setDate(weekLater.getDate() + 7);
  
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments(
    today,
    weekLater.toISOString().split('T')[0]
  );

  const todayAppointments = appointments?.filter(apt => 
    apt.start?.startsWith(today)
  ) || [];

  return (
    <HospitalLayout>
      <div className="space-y-8">
        {/* 标题 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-600 mt-1">
            概览您医院的病例、预约和消息
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                待处理病例
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {casesLoading ? '...' : casesData?.total || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                最近 7 天新分配
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                今日预约
              </CardTitle>
              <Calendar className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointmentsLoading ? '...' : todayAppointments.length}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                本周共 {appointments?.length || 0} 个预约
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                未读消息
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-600 mt-1">
                暂无新消息
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最近病例 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>最近病例</CardTitle>
                  <CardDescription>最近 7 天新分配的病例</CardDescription>
                </div>
                <Link to="/hospital/cases">
                  <Button variant="ghost" size="sm">
                    查看全部
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {casesLoading ? (
                <div className="text-center py-8 text-gray-500">
                  加载中...
                </div>
              ) : casesData?.serviceRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无病例
                </div>
              ) : (
                <div className="space-y-4">
                  {casesData?.serviceRequests.slice(0, 5).map((sr) => {
                    const patient = casesData.patients.find(
                      p => p.id === sr.subject?.reference?.split('/')[1]
                    );
                    const progressState = sr.extension?.find(
                      ext => ext.url?.includes('progress-state')
                    )?.valueCode || 'submitted';

                    return (
                      <Link
                        key={sr.id}
                        to={`/hospital/cases/${sr.id}`}
                        className="block hover:bg-gray-50 p-4 rounded-lg border border-gray-200 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                #{patient?.id?.slice(-6) || 'Unknown'}
                              </span>
                              <Badge variant="secondary">
                                {progressState}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              {new Date(sr.meta?.lastUpdated || '').toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 今日/本周预约 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>今日/本周预约</CardTitle>
                  <CardDescription>
                    今日 {todayAppointments.length} 个，本周共 {appointments?.length || 0} 个
                  </CardDescription>
                </div>
                <Link to="/hospital/appointments">
                  <Button variant="ghost" size="sm">
                    查看全部
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="text-center py-8 text-gray-500">
                  加载中...
                </div>
              ) : appointments?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无预约
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments?.slice(0, 5).map((apt) => {
                    const patientParticipant = apt.participant?.find(
                      p => p.actor?.reference?.startsWith('Patient/')
                    );
                    const isToday = apt.start?.startsWith(today);

                    return (
                      <div
                        key={apt.id}
                        className={`p-4 rounded-lg border ${
                          isToday 
                            ? 'border-blue-300 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {patientParticipant?.actor?.display || '患者'}
                              </span>
                              {isToday && (
                                <Badge variant="default">今日</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              {new Date(apt.start || '').toLocaleString('zh-CN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                          <Badge variant="outline">
                            {apt.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 快捷动作 */}
        <Card>
          <CardHeader>
            <CardTitle>快捷动作</CardTitle>
            <CardDescription>常用功能快速入口</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/hospital/cases">
                <Button variant="outline" className="w-full h-24 flex flex-col">
                  <FolderOpen className="h-6 w-6 mb-2" />
                  查看病例
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col"
                onClick={() => setIsBatchUploadOpen(true)}
              >
                <Upload className="h-6 w-6 mb-2" />
                批量上传
              </Button>
              <Link to="/hospital/appointments">
                <Button variant="outline" className="w-full h-24 flex flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  预约管理
                </Button>
              </Link>
              <Link to="/hospital/messages">
                <Button variant="outline" className="w-full h-24 flex flex-col">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  消息中心
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <BatchUploadModal
        open={isBatchUploadOpen}
        onClose={() => setIsBatchUploadOpen(false)}
      />
    </HospitalLayout>
  );
}
