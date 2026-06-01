/**
 * Role-based Router Utility
 *
 * 根据用户角色自动路由到对应的仪表盘
 */

import { MedplumClient } from '@medplum/core';
import type { Reference } from '@medplum/fhirtypes';

export type UserRole = 'patient' | 'hospital' | 'agency' | 'sales' | 'admin';

/**
 * 根据用户 profile 获取重定向路径
 */
export async function getRoleRedirectPath(
  profileReference: string,
  medplum: MedplumClient
): Promise<string> {
  const [resourceType, id] = profileReference.split('/');

  console.log('Determining redirect path for:', { resourceType, id });

  // Patient → /patient
  if (resourceType === 'Patient') {
    return '/patient';
  }

  // Organization (Agency) → /agency
  if (resourceType === 'Organization') {
    return '/agency';
  }

  // Practitioner → 需要查询 PractitionerRole
  if (resourceType === 'Practitioner') {
    return await getPractitionerRedirectPath(id, medplum);
  }

  throw new Error(`Unknown resource type: ${resourceType}`);
}

/**
 * 根据 Practitioner 的 PractitionerRole 判断角色
 */
async function getPractitionerRedirectPath(
  practitionerId: string,
  medplum: MedplumClient
): Promise<string> {
  try {
    // 查询 PractitionerRole
    const roles = await medplum.searchResources('PractitionerRole', {
      practitioner: `Practitioner/${practitionerId}`,
      _count: '10'
    });

    console.log('Found PractitionerRoles:', roles);

    if (roles.length === 0) {
      console.warn('No PractitionerRole found, defaulting to admin');
      return '/admin';
    }

    const role = roles[0];

    // 方法1: 根据 organization 判断
    if (role.organization?.reference) {
      try {
        const org = await medplum.readReference(role.organization as Reference);

        console.log('Organization:', org);

        // 根据 Organization.name 或 type 判断
        const orgName = org.name?.toLowerCase() || '';

        if (orgName.includes('hospital') || orgName.includes('医院')) {
          return '/hospital';
        }

        if (orgName.includes('agency') || orgName.includes('代理') || orgName.includes('机构')) {
          return '/agency';
        }
      } catch (error) {
        console.error('Error reading organization:', error);
      }
    }

    // 方法2: 根据 PractitionerRole.code 判断
    const codes = role.code || [];

    for (const codeableConcept of codes) {
      const codings = codeableConcept.coding || [];

      for (const coding of codings) {
        const code = coding.code?.toLowerCase();

        if (code === 'admin' || code === 'administrator') {
          return '/admin';
        }

        if (code === 'sales' || code === 'salesperson') {
          return '/sales';
        }

        if (code === 'doctor' || code === 'nurse' || code === 'staff' || code === 'physician') {
          return '/hospital';
        }
      }
    }

    // 默认路由：管理员
    console.warn('Unable to determine specific role from PractitionerRole, defaulting to admin');
    return '/admin';

  } catch (error) {
    console.error('Error determining practitioner role:', error);
    throw new Error('Unable to determine user role');
  }
}

/**
 * 获取当前用户角色（用于权限检查）
 */
export async function getCurrentUserRole(
  medplum: MedplumClient
): Promise<UserRole> {
  const profile = medplum.getProfile();

  if (!profile) {
    throw new Error('No active profile');
  }

  const path = await getRoleRedirectPath(profile.reference, medplum);

  // 从路径提取角色
  const role = path.split('/')[1] as UserRole;

  return role;
}

/**
 * 检查当前用户是否有指定角色
 */
export async function hasRole(
  medplum: MedplumClient,
  allowedRoles: UserRole[]
): Promise<boolean> {
  try {
    const currentRole = await getCurrentUserRole(medplum);
    return allowedRoles.includes(currentRole);
  } catch {
    return false;
  }
}

/**
 * 获取角色的显示名称
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    patient: '患者',
    hospital: '医院',
    agency: '代理机构',
    sales: '销售人员',
    admin: '管理员',
  };

  return roleNames[role] || role;
}
