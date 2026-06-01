// 开发环境下的测试工具 - 用于重置 onboarding 状态
export function resetOnboarding() {
  localStorage.removeItem('onboarding_completed');
  console.log('Onboarding state has been reset');
}

// 自动挂载到 window 对象以便在控制台调用
if (typeof window !== 'undefined') {
  (window as any).resetOnboarding = resetOnboarding;
}
