// Browser-only fixtures. Never imported by the app or used against Supabase.
// Start Metro with EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 and a dummy anon key.
const previewUser = {
  id: '00000000-0000-0000-0000-000000000001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'jardim@example.test',
  user_metadata: { name: 'Pessoa de teste' },
  app_metadata: { provider: 'email' },
  created_at: '2026-01-01T00:00:00Z',
};
const previewSession = () => ({
  access_token: 'anxietics-visual-test-only',
  refresh_token: 'anxietics-visual-test-only',
  expires_at: Math.floor(Date.now() / 1000) + 86400,
  expires_in: 86400,
  token_type: 'bearer',
  user: previewUser,
});
async function authenticatePreview(page) {
  await page.addInitScript((session) => {
    if (['localhost', '127.0.0.1'].includes(location.hostname))
      localStorage.setItem('sb-127-auth-token', JSON.stringify(session));
  }, previewSession());
  await page.route('http://127.0.0.1:54321/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(previewUser),
    }),
  );
}
module.exports = { authenticatePreview, previewSession, previewUser };
