// @ts-check
/**
 * Shared contact write-field options + argv→Zoho-body mapping, used by create
 * and edit. Only flags the user actually passed are sent, so `edit` is a partial
 * update. Validation messages use the CLI's flag names, not Zoho field names.
 */

/** yargs options for the writable contact fields (create/edit share these). */
export function contactFieldOptions(yargs) {
  return yargs
    .option('company', { describe: 'Company name', type: 'string' })
    .option('type', { describe: 'Contact type', type: 'string', choices: ['customer', 'vendor'] })
    .option('sub-type', { describe: 'Customer sub-type', type: 'string', choices: ['business', 'individual'] })
    .option('email', { describe: 'Primary contact email', type: 'string' })
    .option('phone', { describe: 'Primary contact phone', type: 'string' })
    .option('website', { describe: 'Website', type: 'string' })
    .option('notes', { describe: 'Notes', type: 'string' })
    .option('payment-terms', { describe: 'Payment terms in days', type: 'number' })
    .option('json', { describe: 'Output raw JSON of the saved record', type: 'boolean' });
}

/** Map parsed argv to a Zoho contact body (only provided fields). */
export function buildContactBody(argv) {
  const body = {};
  if (argv.name !== undefined) body.contact_name = argv.name;
  if (argv.company !== undefined) body.company_name = argv.company;
  if (argv.type !== undefined) body.contact_type = argv.type;
  if (argv.subType !== undefined) body.customer_sub_type = argv.subType;
  if (argv.website !== undefined) body.website = argv.website;
  if (argv.notes !== undefined) body.notes = argv.notes;
  if (argv.paymentTerms !== undefined) body.payment_terms = argv.paymentTerms;
  // Contact-level email/phone live on the primary contact person in Zoho.
  if (argv.email !== undefined || argv.phone !== undefined) {
    body.contact_persons = [
      { email: argv.email, phone: argv.phone, is_primary_contact: true },
    ];
  }
  return body;
}
