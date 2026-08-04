// Supabase setup script
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
async function main() {
  const supabaseUrl = 'https://sqwexehmjefyaknisen.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) { console.log('Set SUPABASE_SERVICE_ROLE_KEY env var'); process.exit(1); }
  const supabase = createClient(supabaseUrl, serviceKey);
  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_create_subscribers.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  try {
    const res = await fetch(supabaseUrl + '/auth/v1/admin/sql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + serviceKey, 'apikey': serviceKey },
      body: JSON.stringify({ query: sql }),
    });
    console.log('Status:', res.status);
    console.log('Response:', await res.text());
  } catch(e) {
    console.log('API failed:', e.message);
    console.log('Run SQL manually at:');
    console.log('  https://supabase.com/dashboard/project/sqwexehmjefyaknisen/sql/new');
  }
}
main();
