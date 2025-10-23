interface Environment {
  NODE_ENV: string;
  BACKEND_URL: string;
  FRONTEND_URL: string;
  IS_PRODUCTION: boolean;
  IS_DEVELOPMENT: boolean;
}

const development: Environment = {
  NODE_ENV: 'development',
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  FRONTEND_URL: 'http://localhost:3000',
  IS_PRODUCTION: false,
  IS_DEVELOPMENT: true
};

const production: Environment = {
  NODE_ENV: 'production',
  BACKEND_URL: 'https://api.pic-events.co.il',
  FRONTEND_URL: 'https://pic-events.co.il',
  IS_PRODUCTION: true,
  IS_DEVELOPMENT: false
};

const currentEnv = import.meta.env.MODE || 'development';
const config: Environment = currentEnv === 'production' ? production : development;

// Allow overriding backend URL for testing
if (import.meta.env.VITE_BACKEND_URL) {
  config.BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  console.log('🔧 Using custom backend URL:', config.BACKEND_URL);
}

// Debug logging
console.log('🌍 Environment Configuration:');
console.log('  - Current Mode:', currentEnv);
console.log('  - Frontend URL:', config.FRONTEND_URL);
console.log('  - Is Production:', config.IS_PRODUCTION);
console.log('  - Is Development:', config.IS_DEVELOPMENT);

export default config;
