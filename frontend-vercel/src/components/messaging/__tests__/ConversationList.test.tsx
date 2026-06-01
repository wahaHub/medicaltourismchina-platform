import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ConversationList from '../ConversationList';
import { useLanguage } from '@/contexts/LanguageContext';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('ConversationList', () => {
  beforeEach(() => {
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        apiCode: 'en',
      },
      t: ((key: string) => ({
        'patientConversations.title': 'Conversations',
        'patientConversations.subtitle': 'Switch between your hospital and Medora care-team sessions.',
        'patientConversations.loading': 'Loading conversations...',
        'patientConversations.empty': 'No patient conversations are available yet.',
        'patientConversations.noMessages': 'No messages yet',
        'patientConversations.readyPreview': 'Conversation ready for your next message.',
        'patientConversations.careTeam': 'Care Team',
        'patientConversations.hospital': 'Hospital',
        'patientConversations.medoraCareTeam': 'Medora Care Team',
        'patientConversations.hospitalConversation': 'Hospital Conversation',
      }[key] ?? key)) as never,
    } as never);
  });

  const conversations = [
    {
      id: 'conversation-hospital-1',
      type: 'patient-hospital' as const,
      sessionKind: 'hospital' as const,
      displayTitle: 'Shanghai East Hospital',
      lastMessageAt: '2026-04-20T10:00:00.000Z',
      lastMessagePreview: 'Please upload your latest scans.',
    },
    {
      id: 'conversation-admin-1',
      type: 'patient-admin' as const,
      sessionKind: 'care-team' as const,
      displayTitle: 'Medora Care Team',
      lastMessageAt: '2026-04-19T09:00:00.000Z',
      lastMessagePreview: 'We have shared your case.',
    },
  ];

  it('renders a compact switcher variant for widget mode', () => {
    const onSelectConversation = vi.fn();

    render(
      <ConversationList
        conversations={conversations}
        activeConversationId="conversation-hospital-1"
        isLoading={false}
        errorMessage={null}
        onSelectConversation={onSelectConversation}
        variant="switcher"
      />,
    );

    expect(screen.getByTestId('compact-session-switcher')).toBeTruthy();
    expect(screen.queryByText(/admin stays first/i)).toBeNull();
    expect(screen.getAllByRole('button')[0].textContent).toContain('Medora Care Team');
    expect(screen.getByRole('button', { name: /shanghai east hospital/i }).className).toContain('rounded-2xl');
    expect(screen.getByRole('button', { name: /shanghai east hospital/i }).className).not.toContain('rounded-full');
    expect(screen.getByRole('button', { name: /shanghai east hospital/i }).className).toContain('h-10');

    fireEvent.click(screen.getByRole('button', { name: /medora care team/i }));

    expect(onSelectConversation).toHaveBeenCalledWith('conversation-admin-1');
  });

  it('enables peek scrolling when three or more sessions are available', () => {
    render(
      <ConversationList
        conversations={[
          ...conversations,
          {
            id: 'conversation-hospital-2',
            type: 'patient-hospital' as const,
            sessionKind: 'hospital' as const,
            displayTitle: 'Peking Union',
            lastMessageAt: '2026-04-18T10:00:00.000Z',
            lastMessagePreview: 'Another hospital reply',
          },
        ]}
        activeConversationId="conversation-admin-1"
        isLoading={false}
        errorMessage={null}
        onSelectConversation={vi.fn()}
        variant="switcher"
      />,
    );

    expect(screen.getByTestId('compact-session-switcher-rail').getAttribute('style')).toContain('grid-auto-columns');
  });

  it('localizes sidebar conversation chrome and fallback content', () => {
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳',
        apiCode: 'zh',
      },
      t: ((key: string) => ({
        'patientConversations.title': '会话',
        'patientConversations.subtitle': '在医院和 Medora 医疗团队会话之间切换。',
        'patientConversations.loading': '正在加载会话...',
        'patientConversations.empty': '暂时还没有患者会话。',
        'patientConversations.noMessages': '暂无消息',
        'patientConversations.readyPreview': '会话已准备好，您可以继续发送消息。',
        'patientConversations.careTeam': '医疗团队',
        'patientConversations.hospital': '医院',
        'patientConversations.medoraCareTeam': 'Medora 医疗团队',
        'patientConversations.hospitalConversation': '医院会话',
      }[key] ?? key)) as never,
    } as never);

    render(
      <ConversationList
        conversations={[
          {
            id: 'conversation-admin-empty',
            type: 'patient-admin' as const,
            sessionKind: 'care-team' as const,
            displayTitle: 'Medora Care Team',
            lastMessageAt: null,
            lastMessagePreview: '',
          },
          {
            id: 'conversation-hospital-fallback',
            type: 'patient-hospital' as const,
            sessionKind: 'hospital' as const,
            displayTitle: 'Hospital Conversation',
            lastMessageAt: null,
            lastMessagePreview: '',
          },
        ]}
        activeConversationId="conversation-admin-empty"
        isLoading={false}
        errorMessage={null}
        onSelectConversation={vi.fn()}
      />,
    );

    expect(screen.getByText('会话')).toBeTruthy();
    expect(screen.getByText('在医院和 Medora 医疗团队会话之间切换。')).toBeTruthy();
    expect(screen.getByText('Medora 医疗团队')).toBeTruthy();
    expect(screen.getByText('医院会话')).toBeTruthy();
    expect(screen.getByText('医疗团队')).toBeTruthy();
    expect(screen.getByText('医院')).toBeTruthy();
    expect(screen.getAllByText('暂无消息')).toHaveLength(2);
    expect(screen.getAllByText('会话已准备好，您可以继续发送消息。')).toHaveLength(2);
  });
});
