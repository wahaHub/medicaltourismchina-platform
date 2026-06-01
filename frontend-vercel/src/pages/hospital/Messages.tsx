/**
 * Messages Center - 消息中心
 * 
 * 功能：
 * - 左侧：会话列表（按患者分组）
 * - 右侧：消息流 + 发送框
 */

import { useState, useMemo } from 'react';
import { HospitalLayout } from '@/components/hospital/HospitalLayout';
import { useServiceRequests } from '@/hooks/hospital/useMedplumResources';
import { MessageThread } from '@/components/hospital/MessageThread';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Messages() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 获取所有病例（用于获取患者列表）
  const { data: casesData, isLoading } = useServiceRequests({ limit: 100 });

  // 构建会话列表（按患者分组）
  const conversations = useMemo(() => {
    if (!casesData) return [];

    return casesData.patients.map((patient) => {
      const serviceRequest = casesData.serviceRequests.find(
        (sr) => sr.subject?.reference === `Patient/${patient.id}`
      );

      return {
        patientId: patient.id!,
        patientCode: `#${patient.id?.slice(-6)}`,
        gender: patient.gender,
        serviceRequestId: serviceRequest?.id,
        lastUpdate: serviceRequest?.meta?.lastUpdated || new Date().toISOString(),
        unreadCount: 0, // TODO: 实现未读计数
      };
    });
  }, [casesData]);

  // 过滤会话
  const filteredConversations = conversations.filter((conv) =>
    conv.patientCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 自动选择第一个会话
  const currentConversation = useMemo(() => {
    if (selectedPatientId) {
      return conversations.find((c) => c.patientId === selectedPatientId);
    }
    if (filteredConversations.length > 0 && !selectedPatientId) {
      setSelectedPatientId(filteredConversations[0].patientId);
      return filteredConversations[0];
    }
    return null;
  }, [selectedPatientId, filteredConversations, conversations]);

  return (
    <HospitalLayout>
      <div className="space-y-6">
        {/* 标题 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">消息中心</h1>
          <p className="text-gray-600 mt-1">
            与患者、代理机构和管理员沟通
          </p>
        </div>

        {/* 主内容区 */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
          {/* 左侧：会话列表 */}
          <div className="col-span-4">
            <Card className="h-full flex flex-col">
              {/* 搜索框 */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索患者..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 会话列表 */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-12 text-gray-500">
                    加载中...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>暂无会话</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.patientId}
                        onClick={() => setSelectedPatientId(conv.patientId)}
                        className={cn(
                          'w-full p-4 text-left hover:bg-gray-50 transition-colors',
                          selectedPatientId === conv.patientId &&
                            'bg-blue-50 hover:bg-blue-50 border-l-4 border-blue-500'
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                患者 {conv.patientCode}
                              </p>
                              <p className="text-xs text-gray-500">
                                {conv.gender === 'male' ? '男' : conv.gender === 'female' ? '女' : ''}
                              </p>
                            </div>
                          </div>
                          {conv.unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          最后更新：
                          {new Date(conv.lastUpdate).toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* 右侧：消息流 */}
          <div className="col-span-8">
            <Card className="h-full flex flex-col">
              {currentConversation ? (
                <>
                  {/* 会话标题 */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          患者 {currentConversation.patientCode}
                        </h3>
                        <p className="text-sm text-gray-500">
                          病例ID: {currentConversation.serviceRequestId || '未知'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 消息线程 */}
                  <div className="flex-1 overflow-hidden p-4">
                    <MessageThread patientId={currentConversation.patientId} />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">选择一个会话</p>
                    <p className="text-sm mt-1">从左侧列表中选择患者开始沟通</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </HospitalLayout>
  );
}
