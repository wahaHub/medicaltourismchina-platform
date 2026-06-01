/**
 * Message Thread Component
 * 消息线程：显示和发送消息
 */

import { useState } from 'react';
import { useCommunications, useSendCommunication } from '@/hooks/hospital/useMedplumResources';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MessageThreadProps {
  patientId: string;
}

export function MessageThread({ patientId }: MessageThreadProps) {
  const [message, setMessage] = useState('');
  const { data: communications, isLoading } = useCommunications(patientId);
  const sendMutation = useSendCommunication();

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: '错误',
        description: '请输入消息内容',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sendMutation.mutateAsync({
        patientId,
        message: message.trim(),
      });

      setMessage('');
      toast({
        title: '发送成功',
        description: '消息已发送',
      });
    } catch (error) {
      toast({
        title: '发送失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        加载消息中...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 消息列表 */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {communications && communications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无消息
          </div>
        ) : (
          communications?.map((comm) => {
            const isSentByHospital = comm.sender?.reference?.includes('Organization');
            const senderName = comm.sender?.display || (isSentByHospital ? '医院' : '发送方');
            
            return (
              <Card
                key={comm.id}
                className={`p-4 ${
                  isSentByHospital
                    ? 'bg-blue-50 border-blue-200 ml-8'
                    : 'bg-gray-50 border-gray-200 mr-8'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-sm text-gray-900">
                    {senderName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comm.sent || '').toLocaleString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comm.payload?.[0]?.contentString || '(空消息)'}
                </p>
              </Card>
            );
          })
        )}
      </div>

      {/* 发送框 */}
      <div className="space-y-2">
        <Textarea
          placeholder="输入消息..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleSend();
            }
          }}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            {sendMutation.isPending ? '发送中...' : '发送'}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Ctrl + Enter 快速发送
        </p>
      </div>
    </div>
  );
}
