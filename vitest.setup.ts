import '@testing-library/jest-dom/vitest';

// Test-only env var stubs so modules that read process.env don't blow up
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
process.env.ANTHROPIC_MODEL_ID = 'claude-sonnet-4-6-20260301';
process.env.ANTHROPIC_HAIKU_MODEL_ID = 'claude-haiku-4-5-20251001';
process.env.CONSENT_IP_PEPPER_V1 = '0'.repeat(64);
process.env.CRISIS_PEPPER_V1 = '1'.repeat(64);
process.env.RESEARCH_PEPPER_V1 = '2'.repeat(64);
process.env.DELETE_TOKEN_PEPPER_V1 = '3'.repeat(64);
process.env.DAILY_TOKEN_CAP = '15000';
process.env.DAILY_COST_CAP_CENTS = '200';
process.env.GLOBAL_DAILY_BUDGET_USD = '50';
