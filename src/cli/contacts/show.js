// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatSection } from '../utils/format.js';

export async function showContactHandler(argv) {
  const zb = clientFor();
  const c = await zb.contacts.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(c, null, 2));
    return;
  }

  if (!c) {
    console.error(`No contact found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 22;
  console.log(formatField('ID', c.contact_id, w));
  console.log(formatField('Name', c.contact_name, w));
  console.log(formatField('Company', c.company_name, w));
  console.log(formatField('Type', c.contact_type, w));
  console.log(formatField('Sub-type', c.customer_sub_type, w));
  console.log(formatField('Status', c.status, w));
  console.log(formatField('Email', c.email, w));
  console.log(formatField('Phone', c.phone || c.mobile, w));
  console.log(formatField('Currency', c.currency_code, w));
  console.log(formatField('Payment Terms', c.payment_terms_label, w));
  console.log(formatField('Receivable', formatCurrency(c.outstanding_receivable_amount), w));
  console.log(formatField('Payable', formatCurrency(c.outstanding_payable_amount), w));
  console.log(formatField('Unused Credits', formatCurrency(c.unused_credits_receivable_amount), w));

  const persons = c.contact_persons ?? [];
  if (persons.length) {
    console.log(formatSection('Contact Persons'));
    for (const p of persons) {
      const primary = p.is_primary_contact ? ' (primary)' : '';
      const name = [p.first_name, p.last_name].filter(Boolean).join(' ');
      console.log(`  ${name}${primary} — ${p.email ?? ''} ${p.phone ?? ''}`.trimEnd());
    }
  }

  const addr = c.billing_address;
  if (addr && (addr.address || addr.city)) {
    console.log(formatSection('Billing Address'));
    for (const line of [addr.attention, addr.address, addr.street2, [addr.city, addr.state, addr.zip].filter(Boolean).join(' '), addr.country]) {
      if (line) console.log(`  ${line}`);
    }
  }
}
