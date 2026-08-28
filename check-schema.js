const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function getSchema() {
  const { data: contractTemplates } = await supabase.from('contract_templates').select('*').limit(1);
  console.log('contract_templates:', Object.keys(contractTemplates[0] || {}));

  const { data: managerContracts } = await supabase.from('manager_contracts').select('*').limit(1);
  console.log('manager_contracts:', Object.keys(managerContracts[0] || {}));
}

getSchema();
