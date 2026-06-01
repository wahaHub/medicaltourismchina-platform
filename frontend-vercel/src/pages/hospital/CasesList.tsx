/**
 * Hospital Cases List - 病例列表
 * 
 * 显示医院被指派的所有病例，支持筛选和搜索
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HospitalLayout } from '@/components/hospital/HospitalLayout';
import { useServiceRequests } from '@/hooks/hospital/useMedplumResources';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, ArrowRight } from 'lucide-react';

const PROGRESS_STATES = [
  { value: 'all', label: '全部状态' },
  { value: 'submitted', label: '已提交' },
  { value: 'triaging', label: '分诊中' },
  { value: 'quoted', label: '已报价' },
  { value: 'invitation-issued', label: '邀请函已发' },
  { value: 'travel', label: '旅行中' },
  { value: 'in-china', label: '在华治疗' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

const STATE_COLORS: Record<string, string> = {
  submitted: 'bg-yellow-100 text-yellow-800',
  triaging: 'bg-blue-100 text-blue-800',
  quoted: 'bg-purple-100 text-purple-800',
  'invitation-issued': 'bg-green-100 text-green-800',
  travel: 'bg-indigo-100 text-indigo-800',
  'in-china': 'bg-pink-100 text-pink-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function CasesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');

  const { data, isLoading, error } = useServiceRequests({
    progressState: stateFilter === 'all' ? undefined : [stateFilter],
    limit: 50,
  });

  // 客户端搜索过滤
  const filteredCases = data?.serviceRequests.filter((sr) => {
    if (!searchTerm) return true;
    const patient = data.patients.find(
      p => p.id === sr.subject?.reference?.split('/')[1]
    );
    return (
      sr.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  return (
    <HospitalLayout>
      <div className="space-y-6">
        {/* 标题 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">病例列表</h1>
          <p className="text-gray-600 mt-1">
            管理您医院的所有分配病例
          </p>
        </div>

        {/* 筛选器 */}
        <Card>
          <CardHeader>
            <CardTitle>筛选</CardTitle>
            <CardDescription>按状态和关键词筛选病例</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索患者ID或ServiceRequest ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRESS_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 病例表格 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>病例</CardTitle>
                <CardDescription>
                  共 {filteredCases.length} 个病例
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                加载中...
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                加载失败：{error.message}
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                暂无病例
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>患者代号</TableHead>
                    <TableHead>当前进度</TableHead>
                    <TableHead>指派时间</TableHead>
                    <TableHead>最近更新</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((sr) => {
                    const patient = data.patients.find(
                      p => p.id === sr.subject?.reference?.split('/')[1]
                    );
                    const progressState = sr.extension?.find(
                      ext => ext.url?.includes('progress-state')
                    )?.valueCode || 'submitted';
                    
                    return (
                      <TableRow key={sr.id}>
                        <TableCell className="font-medium">
                          #{patient?.id?.slice(-6) || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATE_COLORS[progressState] || 'bg-gray-100 text-gray-800'}>
                            {PROGRESS_STATES.find(s => s.value === progressState)?.label || progressState}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(sr.meta?.lastUpdated || '').toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(sr.meta?.lastUpdated || '').toLocaleDateString('zh-CN')}
                        </TableCell>
                        <TableCell>
                          <Link to={`/hospital/cases/${sr.id}`}>
                            <Button variant="ghost" size="sm">
                              查看详情
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </HospitalLayout>
  );
}
