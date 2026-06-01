/**
 * Appointments Page - 预约管理
 * 
 * 功能：
 * - 日历视图/列表视图切换
 * - 创建新预约
 * - 编辑/取消预约
 */

import { useState } from 'react';
import { HospitalLayout } from '@/components/hospital/HospitalLayout';
import { useAppointments, useCreateAppointment, useServiceRequests } from '@/hooks/hospital/useMedplumResources';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarIcon, List, Plus, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const SERVICE_TYPES = [
  { value: '124', label: '全科门诊' },
  { value: '165', label: '专科门诊' },
  { value: '221', label: '手术' },
  { value: '310', label: '复查' },
];

const STATUS_COLORS: Record<string, string> = {
  booked: 'bg-blue-100 text-blue-800',
  arrived: 'bg-green-100 text-green-800',
  fulfilled: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  'noshow': 'bg-yellow-100 text-yellow-800',
};

export default function Appointments() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // 获取本周预约
  const today = new Date().toISOString().split('T')[0];
  const weekLater = new Date();
  weekLater.setDate(weekLater.getDate() + 30);
  
  const { data: appointments, isLoading } = useAppointments(
    today,
    weekLater.toISOString().split('T')[0]
  );

  // 获取病例列表用于创建预约
  const { data: casesData } = useServiceRequests({ limit: 100 });
  const createMutation = useCreateAppointment();

  // 创建预约表单状态
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    date: '',
    time: '',
    serviceType: '',
  });

  const handleCreateAppointment = async () => {
    if (!newAppointment.patientId || !newAppointment.date || !newAppointment.time) {
      toast({
        title: '错误',
        description: '请填写所有必填字段',
        variant: 'destructive',
      });
      return;
    }

    const startDateTime = `${newAppointment.date}T${newAppointment.time}:00`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

    try {
      await createMutation.mutateAsync({
        patientId: newAppointment.patientId,
        start: startDateTime,
        end: endDateTime,
        serviceType: newAppointment.serviceType || '124',
      });

      toast({
        title: '创建成功',
        description: '预约已创建',
      });

      setIsCreateDialogOpen(false);
      setNewAppointment({ patientId: '', date: '', time: '', serviceType: '' });
    } catch (error) {
      toast({
        title: '创建失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  return (
    <HospitalLayout>
      <div className="space-y-6">
        {/* 标题和操作 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">预约管理</h1>
            <p className="text-gray-600 mt-1">
              管理您医院的所有预约
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 视图切换 */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                列表
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                日历
              </Button>
            </div>

            {/* 创建预约 */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  创建预约
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>创建新预约</DialogTitle>
                  <DialogDescription>
                    为患者创建新的预约
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* 选择患者 */}
                  <div className="space-y-2">
                    <Label htmlFor="patient">患者 *</Label>
                    <Select
                      value={newAppointment.patientId}
                      onValueChange={(value) =>
                        setNewAppointment({ ...newAppointment, patientId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择患者" />
                      </SelectTrigger>
                      <SelectContent>
                        {casesData?.patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id!}>
                            #{patient.id?.slice(-6)} - {patient.gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 预约日期 */}
                  <div className="space-y-2">
                    <Label htmlFor="date">日期 *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) =>
                        setNewAppointment({ ...newAppointment, date: e.target.value })
                      }
                    />
                  </div>

                  {/* 预约时间 */}
                  <div className="space-y-2">
                    <Label htmlFor="time">时间 *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) =>
                        setNewAppointment({ ...newAppointment, time: e.target.value })
                      }
                    />
                  </div>

                  {/* 服务类型 */}
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">服务类型</Label>
                    <Select
                      value={newAppointment.serviceType}
                      onValueChange={(value) =>
                        setNewAppointment({ ...newAppointment, serviceType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择服务类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleCreateAppointment}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? '创建中...' : '创建预约'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 预约列表 */}
        {viewMode === 'list' && (
          <Card>
            <CardHeader>
              <CardTitle>预约列表</CardTitle>
              <CardDescription>
                共 {appointments?.length || 0} 个预约
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12 text-gray-500">
                  加载中...
                </div>
              ) : appointments && appointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  暂无预约
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>预约时间</TableHead>
                      <TableHead>患者</TableHead>
                      <TableHead>服务类型</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments?.map((apt) => {
                      const patientParticipant = apt.participant?.find(
                        (p) => p.actor?.reference?.startsWith('Patient/')
                      );
                      const serviceTypeDisplay =
                        apt.serviceType?.[0]?.coding?.[0]?.display || '未知';

                      return (
                        <TableRow key={apt.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">
                                  {new Date(apt.start || '').toLocaleDateString('zh-CN', {
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(apt.start || '').toLocaleTimeString('zh-CN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {patientParticipant?.actor?.display ||
                              patientParticipant?.actor?.reference ||
                              '未知患者'}
                          </TableCell>
                          <TableCell>{serviceTypeDisplay}</TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[apt.status || 'booked']}>
                              {apt.status || 'booked'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              详情
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* 日历视图 (简化版) */}
        {viewMode === 'calendar' && (
          <Card>
            <CardHeader>
              <CardTitle>日历视图</CardTitle>
              <CardDescription>
                日历视图（开发中）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                日历视图功能开发中...
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </HospitalLayout>
  );
}
