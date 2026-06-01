import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '../HomePage';

vi.mock('@/services/api/department', () => ({
  departmentApi: {
    getDept: vi.fn().mockResolvedValue({
      data: [
        { slug: 'plastic-surgery', name: '整形与重建外科', name_en: 'Plastic Surgery' },
        { slug: 'cardiology', name: '心脏科', name_en: 'Cardiology' },
      ],
    }),
  },
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: {
      code: 'zh',
      apiCode: 'zh',
    },
  }),
}));

vi.mock('@/hooks/usePatientAuth', () => ({
  usePatientAuth: () => ({
    patient: {
      id: 'patient-1',
      name: '还是你浩哥123',
      email: 'patient@example.com',
      phone: '+86 138 0000 0000',
      age: '32',
      gender: 'male',
      country: 'China',
      department: '整形与重建外科',
      disease: 'zhengxing',
      destination: '深圳, 广州',
      treatmentTime: '1-3个月',
    },
  }),
}));

vi.mock('@/hooks/usePatientDashboard', () => ({
  usePatientDashboardHome: () => ({
    data: {
      patientName: '还是你浩哥123',
      patientEmail: 'patient@example.com',
      caseCount: 1,
      pendingQuoteCount: 0,
      totalQuoteCount: 0,
      activeCase: {
        id: 'case-1',
        caseNumber: 'CASE-1',
        patientName: '还是你浩哥123',
        patientCountry: 'China',
        patientLanguage: 'zh',
        patientEmail: 'patient@example.com',
        patientPhone: '+86 138 0000 0000',
        assignedHospitalId: null,
        hospitalName: null,
        primaryDiagnosis: 'zhengxing',
        status: 'ACTIVE',
        stage: 'ACTIVE',
        assignmentStatus: '轮询兜底中',
        treatmentStage: '选择医院',
        riskLevel: null,
        aiSummary: null,
        assignedAt: null,
        createdAt: '2026-06-01T00:00:00.000Z',
        updatedAt: '2026-06-01T00:00:00.000Z',
      },
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/usePatientPhase2', () => ({
  usePatientOrders: () => ({ data: { total: 0 } }),
  usePatientTickets: () => ({ data: { total: 0 } }),
}));

vi.mock('../CurrentCaseModal', () => ({
  default: () => null,
}));

describe('HomePage', () => {
  it('shows patient intake details instead of case, quote, ticket, and order counters', () => {
    render(<HomePage />);

    expect(screen.queryByText('病例数')).toBeNull();
    expect(screen.queryByText('待处理报价')).toBeNull();
    expect(screen.queryByText('未关闭工单')).toBeNull();
    expect(screen.queryByText('订单')).toBeNull();

    expect(screen.getByText('还是你浩哥123')).toBeTruthy();
    expect(screen.getByText('patient@example.com')).toBeTruthy();
    expect(screen.getByText('+86 138 0000 0000')).toBeTruthy();
    expect(screen.getByText('32')).toBeTruthy();
    expect(screen.getByText('整形与重建外科')).toBeTruthy();
    expect(screen.getAllByText('zhengxing').length).toBeGreaterThan(0);
    expect(screen.getByText('深圳, 广州')).toBeTruthy();
    expect(screen.getByText('1-3个月')).toBeTruthy();
  });

  it('localizes age and lets intake fields be edited while email remains locked', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    expect(screen.queryByText('chatWidget.form.age')).toBeNull();
    expect(screen.getByText('年龄')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /编辑 电话/i }));
    const phoneInput = screen.getByRole('textbox', { name: '电话' });
    await user.clear(phoneInput);
    await user.type(phoneInput, '+86 139 1111 2222');
    await user.keyboard('{Enter}');

    expect(screen.getByText('保存中')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText('+86 139 1111 2222')).toBeTruthy();
    });
    expect(screen.queryByRole('button', { name: /编辑 邮箱/i })).toBeNull();
    expect(screen.getByText('patient@example.com')).toBeTruthy();
  });

  it('uses option controls for department, destination, treatment time, gender, and country', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByRole('button', { name: /编辑 科室/i }));
    expect(screen.getByRole('combobox', { name: '科室' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /编辑 意向城市/i }));
    expect(screen.getByRole('button', { name: '意向城市' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /编辑 治疗时间/i }));
    expect(screen.getByRole('combobox', { name: '治疗时间' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /编辑 性别/i }));
    expect(screen.getByRole('combobox', { name: '性别' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '编辑 国家/地区' }));
    expect(screen.getByRole('combobox', { name: '国家/地区' })).toBeTruthy();
  });
});
