/*
  Simple smoke test for cases/auth flows.
  Run after backend is started on http://localhost:4000
  Usage: node scripts/smoke-test.js
*/

const BASE = 'http://localhost:4000'

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, opts)
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch (e) { json = text }
  return { ok: res.ok, status: res.status, body: json }
}

async function main() {
  console.log('Starting smoke tests...')

  // register admin
  let r = await req('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'smoke-admin@example.com', password: 'pass123', role: 'Admin' }) })
  console.log('register admin', r.status)

  // register dca
  r = await req('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'smoke-dca@example.com', password: 'pass123', role: 'DCA' }) })
  console.log('register dca', r.status)

  // login admin
  r = await req('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'smoke-admin@example.com', password: 'pass123' }) })
  if (!r.ok) { console.error('login failed', r); process.exit(2) }
  const token = r.body.accessToken
  console.log('login OK')

  // find dca user id
  // naive: register returned created user id in prior response
  // but here we can create a case without assigned_dca then patch

  // create case
  r = await req('/cases', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ customer_id: 'CUST-100', amount: 123.45, ageing_days: 5 }) })
  if (!r.ok) { console.error('create case failed', r); process.exit(3) }
  const caseId = r.body.case.id
  console.log('created case', caseId)

  // list cases
  r = await req('/cases', { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) { console.error('list cases failed', r); process.exit(4) }
  console.log('list cases OK, found', (r.body.cases || []).length)

  // patch case set assigned_dca to 2 (assume user with id 2 exists from registration sequence)
  r = await req(`/cases/${caseId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ assigned_dca: 2 }) })
  if (!r.ok) { console.error('assign failed', r); process.exit(5) }
  console.log('assign OK')

  // get case
  r = await req(`/cases/${caseId}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) { console.error('get case failed', r); process.exit(6) }
  console.log('get case, assignments', (r.body.assignments || []).length)

  // close case
  r = await req(`/cases/${caseId}/close`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) { console.error('close failed', r); process.exit(7) }
  console.log('closed case')

  console.log('Smoke tests passed ✅')
}

main().catch((e) => { console.error('smoke test failed', e); process.exit(1) })
