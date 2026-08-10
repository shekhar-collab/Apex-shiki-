const test = require('node:test');
const assert = require('node:assert/strict');
const { buildFeeReminderNotification } = require('../utils/feeReminder');

test('builds a reminder notification for a pending fee', () => {
  const fee = {
    id: 7,
    memberName: 'Asha Rao',
    amount: 2500,
    dueDate: '2026-08-15',
  };

  const notification = buildFeeReminderNotification(fee);

  assert.equal(notification.title, 'Fee reminder sent — Asha Rao');
  assert.match(notification.desc, /Asha Rao/);
  assert.match(notification.desc, /2500/);
  assert.match(notification.desc, /2026-08-15/);
  assert.equal(notification.icon, 'fees');
  assert.equal(notification.color, 'gold');
});
