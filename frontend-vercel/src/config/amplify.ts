import { Amplify } from 'aws-amplify';

// AWS Cognito 配置
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'eu-west-1_1WDPI7VGY',
      userPoolClientId: '24vqnusud2ad1kcs34vbfkcfll',
      region: 'eu-west-1',
      loginWith: {
        oauth: {
          domain: 'medicaltourismchina.auth.eu-west-1.amazoncognito.com', // 不要包含 https://
          scopes: ['openid', 'email', 'phone'],
          redirectSignIn: ['http://localhost:3000/auth/callback', 'https://www.medicaltourismchina.health/auth/callback'],
          redirectSignOut: ['http://localhost:3000/auth/logout', 'https://www.medicaltourismchina.health/auth/logout'],
          responseType: 'code' as const,
        },
        email: false, // 禁用邮箱密码登录，只使用社交登录
        phone: false,
      },
    },
  },
};

// 配置 Amplify
Amplify.configure(amplifyConfig);

export default amplifyConfig;

