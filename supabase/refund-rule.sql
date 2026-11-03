-- Full refund if the customer cancels at least 6 hours before the booking.
update public.settings
set refund_percent = 100,
    refund_cutoff_hours = 6
where id = 1;

select refund_percent, refund_cutoff_hours from public.settings;
