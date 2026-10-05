// Tests exercise the deterministic fallback paths and must never spend
// real OpenAI credit or send real email, whatever .env.local contains.
delete process.env.OPENAI_API_KEY;
delete process.env.ANTHROPIC_API_KEY;
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
delete process.env.EMAIL_SMTP_HOST;
delete process.env.EMAIL_SMTP_USER;
delete process.env.EMAIL_SMTP_PASS;
delete process.env.EMAIL_NOTIFY_TO;
