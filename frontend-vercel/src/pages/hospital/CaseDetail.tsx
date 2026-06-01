/**
 * Case Detail Page
 * 病例详情页 - 显示完整病例信息
 */

import { useParams } from 'react-router-dom';
import { HospitalLayout } from '@/components/hospital/HospitalLayout';
import {
  useServiceRequest,
  usePatient,
  useDocumentReferences,
} from '@/hooks/hospital/useMedplumResources';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressUpdater } from '@/components/hospital/ProgressUpdater';
import { MessageThread } from '@/components/hospital/MessageThread';
import {
  User,
  Building2,
  Calendar,
  FileText,
  Download,
  Upload,
} from 'lucide-react';

const STATE_LABELS: Record<string, string> = {
  submitted: '已提交',
  triaging: '分诊中',
  quoted: '已报价',
  'invitation-issued': '邀请函已发',
  travel: '旅行中',
  'in-china': '在华治疗',
  completed: '已完成',
  cancelled: '已取消',
};

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  
  const { data: sr, isLoading: srLoading } = useServiceRequest(caseId);
  const patientId = sr?.subject?.reference?.split('/')[1];
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  
  const { data: clinicalDocs } = useDocumentReferences(patientId, 'clinical');
  const { data: invitationDocs } = useDocumentReferences(patientId, 'invitation');

  if (srLoading || patientLoading) {
    return (
      <HospitalLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">加载中...</p>
        </div>
      </HospitalLayout>
    );
  }

  if (!sr || !patient) {
    return (
      <HospitalLayout>
        <div className="text-center py-12">
          <p className="text-red-500">病例未找到</p>
        </div>
      </HospitalLayout>
    );
  }

  const progressState = sr.extension?.find(
    ext => ext.url?.includes('progress-state')
  )?.valueCode || 'submitted';

  const performerOrg = sr.performer?.[0];
  const requesterOrg = sr.requester;

  return (
    <HospitalLayout>
      <div className="space-y-6">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
        >
          ← 返回病例列表
        </Button>

        {/* 摘要卡 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  病例详情 #{patient.id?.slice(-6)}
                </CardTitle>
                <Badge className="mt-2 text-base">
                  {STATE_LABELS[progressState] || progressState}
                </Badge>
              </div>
              <div className="w-64">
                <ProgressUpdater
                  srId={sr.id!}
                  currentState={progressState}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 患者信息 */}
              <div className="space-y-3">
                <div className="flex items-center text-sm font-medium text-gray-500">
                  <User className="mr-2 h-4 w-4" />
                  患者信息
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">代号：</span>
                    <span className="text-sm font-medium">#{patient.id?.slice(-6)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">性别：</span>
                    <span className="text-sm font-medium">
                      {patient.gender === 'male' ? '男' : patient.gender === 'female' ? '女' : '未知'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">出生日期：</span>
                    <span className="text-sm font-medium">
                      {patient.birthDate || '未知'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 医院信息 */}
              <div className="space-y-3">
                <div className="flex items-center text-sm font-medium text-gray-500">
                  <Building2 className="mr-2 h-4 w-4" />
                  医院信息
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">指派医院：</span>
                    <span className="text-sm font-medium">
                      {performerOrg?.display || '(本院)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">申请方：</span>
                    <span className="text-sm font-medium">
                      {requesterOrg?.display || '未知'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 时间信息 */}
              <div className="space-y-3">
                <div className="flex items-center text-sm font-medium text-gray-500">
                  <Calendar className="mr-2 h-4 w-4" />
                  时间信息
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">创建时间：</span>
                    <span className="text-sm font-medium">
                      {new Date(sr.meta?.lastUpdated || '').toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">最近更新：</span>
                    <span className="text-sm font-medium">
                      {new Date(sr.meta?.lastUpdated || '').toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 标签页内容 */}
        <Tabs defaultValue="clinical" className="space-y-4">
          <TabsList>
            <TabsTrigger value="clinical">
              <FileText className="mr-2 h-4 w-4" />
              临床文档
            </TabsTrigger>
            <TabsTrigger value="invitation">
              <FileText className="mr-2 h-4 w-4" />
              邀请函
            </TabsTrigger>
            <TabsTrigger value="messages">
              消息
            </TabsTrigger>
          </TabsList>

          {/* 临床文档 */}
          <TabsContent value="clinical">
            <Card>
              <CardHeader>
                <CardTitle>临床文档</CardTitle>
              </CardHeader>
              <CardContent>
                {clinicalDocs && clinicalDocs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    暂无临床文档
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clinicalDocs?.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-sm">
                              {doc.content?.[0]?.attachment?.title || '未命名文档'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(doc.date || '').toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 邀请函 */}
          <TabsContent value="invitation">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>邀请函</CardTitle>
                  <Button variant="default">
                    <Upload className="mr-2 h-4 w-4" />
                    上传邀请函
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {invitationDocs && invitationDocs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    暂未上传邀请函
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitationDocs?.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-sm">
                              {doc.content?.[0]?.attachment?.title || '邀请函'}
                            </p>
                            <p className="text-xs text-gray-500">
                              签发时间：{new Date(doc.date || '').toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 消息 */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>消息</CardTitle>
              </CardHeader>
              <CardContent>
                <MessageThread patientId={patient.id!} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HospitalLayout>
  );
}
