// your status flow, in words the customer understands (used by several pages)
export const STATUS = {
  pending:          { label: 'Waiting for courier', color: 'secondary' },
  assigned:         { label: 'Courier assigned',    color: 'info' },
  picked_up:        { label: 'Picked up',           color: 'primary' },
  out_for_delivery: { label: 'Out for delivery',    color: 'warning' },
  delivered:        { label: 'Delivered',           color: 'success' },
  failed:           { label: 'Delivery failed',     color: 'danger' },
  returned:         { label: 'Returned to sender',  color: 'dark' },
  cancelled:        { label: 'Cancelled',           color: 'secondary' },
};

// e.g. "17 Oct, 10:52 am" in Singapore time
export function formatTime(t) {
  return new Date(t).toLocaleString('en-SG', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  });
}