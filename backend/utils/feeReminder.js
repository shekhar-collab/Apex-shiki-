function buildFeeReminderNotification(fee) {
  const memberName = fee?.memberName || 'member';
  const amount = fee?.amount ?? 0;
  const dueDate = fee?.dueDate || 'soon';

  return {
    icon: 'fees',
    color: 'gold',
    title: `Fee reminder sent — ${memberName}`,
    desc: `A reminder was sent to ${memberName} to submit their fee of ₹${amount} by ${dueDate}.`,
    time: 'Just now',
  };
}

module.exports = { buildFeeReminderNotification };
