// @ts-check
import { clientFor } from '../_helpers.js';
import { formatField, formatDate } from '../utils/format.js';

export async function showTimeEntryHandler(argv) {
  const zb = clientFor();
  const t = await zb.timeEntries.get(argv.id);

  if (argv.json) {
    console.log(JSON.stringify(t, null, 2));
    return;
  }
  if (!t) {
    console.error(`No time entry found for id: ${argv.id}`);
    process.exit(1);
  }

  const w = 18;
  console.log(formatField('ID', t.time_entry_id, w));
  console.log(formatField('Project', t.project_name, w));
  console.log(formatField('Task', t.task_name, w));
  console.log(formatField('User', t.user_name, w));
  console.log(formatField('Date', formatDate(t.log_date), w));
  console.log(formatField('Hours', t.log_time, w));
  console.log(formatField('Billable', t.is_billable ? 'yes' : 'no', w));
  console.log(formatField('Notes', t.notes, w));
}
