/**
 * Progress Updater Component
 * 进度更新器：允许医院更新 ServiceRequest 的进度状态
 */

import { useState } from 'react';
import { useUpdateServiceRequestProgress } from '@/hooks/hospital/useMedplumResources';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const STATE_TRANSITIONS: Record<string, string[]> = {
  submitted: ['triaging'],
  triaging: ['quoted'],
  quoted: ['invitation-issued'],
  'invitation-issued': ['travel'],
  travel: ['in-china'],
  'in-china': ['completed'],
  completed: [],
};

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

interface ProgressUpdaterProps {
  srId: string;
  currentState: string;
}

export function ProgressUpdater({ srId, currentState }: ProgressUpdaterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newState, setNewState] = useState('');
  const [note, setNote] = useState('');
  
  const updateMutation = useUpdateServiceRequestProgress();

  const availableStates = STATE_TRANSITIONS[currentState] || [];

  const handleUpdate = async () => {
    if (!newState) {
      toast({
        title: '错误',
        description: '请选择新状态',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        srId,
        newState,
        note: note.trim() || undefined,
      });

      toast({
        title: '更新成功',
        description: `进度已更新为：${STATE_LABELS[newState]}`,
      });

      setIsOpen(false);
      setNewState('');
      setNote('');
    } catch (error) {
      toast({
        title: '更新失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  if (availableStates.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          更新进度
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>更新病例进度</DialogTitle>
          <DialogDescription>
            当前状态：
            <Badge className="ml-2">{STATE_LABELS[currentState]}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">新状态</label>
            <Select value={newState} onValueChange={setNewState}>
              <SelectTrigger>
                <SelectValue placeholder="选择下一步状态" />
              </SelectTrigger>
              <SelectContent>
                {availableStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {STATE_LABELS[state]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">备注（可选）</label>
            <Textarea
              placeholder="添加进度更新备注..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            取消
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!newState || updateMutation.isPending}
          >
            {updateMutation.isPending ? '更新中...' : '确认更新'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
