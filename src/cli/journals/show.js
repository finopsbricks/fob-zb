// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatCurrency, formatDate, formatSection, formatTable } from '../utils/format.js';

export async function showJournalHandler(argv) {
  const zb = clientFor();
  const j = await zb.journals.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(j, null, 2));
    return;
  }
  if (!j) {
    console.error(`No journal found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', j.journal_id, w));
  console.log(formatField('Date', formatDate(j.journal_date), w));
  console.log(formatField('Entry', j.entry_number, w));
  console.log(formatField('Reference', j.reference_number, w));
  console.log(formatField('Notes', j.notes, w));
  console.log(formatField('Status', j.status, w));
  console.log(formatField('Total', formatCurrency(j.total), w));

  const lines = j.line_items ?? [];
  if (lines.length) {
    console.log(formatSection('Line Items'));
    console.log(
      formatTable(
        ['ACCOUNT', 'DESCRIPTION', 'DR/CR', 'AMOUNT'],
        lines.map((l) => [
          l.account_name ?? '',
          (l.description ?? '').slice(0, 40),
          l.debit_or_credit ?? '',
          formatCurrency(l.amount),
        ]),
        { align: ['left', 'left', 'left', 'right'] },
      ),
    );
  }
}
