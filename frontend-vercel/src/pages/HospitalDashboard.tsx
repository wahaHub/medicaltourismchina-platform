/**
 * Hospital Dashboard Router
 * 医院端路由入口
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleBasedRoute } from '../components/auth/RoleBasedRoute';
import Dashboard from './hospital/Dashboard';
import CasesList from './hospital/CasesList';
import CaseDetail from './hospital/CaseDetail';
import Appointments from './hospital/Appointments';
import Messages from './hospital/Messages';

export default function HospitalDashboard() {
  return (
    <RoleBasedRoute allowedRole="hospital">
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="cases" element={<CasesList />} />
        <Route path="cases/:caseId" element={<CaseDetail />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="messages" element={<Messages />} />
        {/* TODO: 其他路由 */}
        <Route path="settings" element={<div>设置（开发中）</div>} />
        <Route path="*" element={<Navigate to="/hospital" replace />} />
      </Routes>
    </RoleBasedRoute>
  );
}
