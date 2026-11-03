"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/FormField";
import { cancelBooking, respondToBooking } from "@/lib/booking-actions";

// Accept and decline, for the spa.
export function AnswerButtons({ bookingId }: { bookingId: string }) {
  const [state, action, pending] = useActionState(respondToBooking, {});

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="booking_id" value={bookingId} />
      <div className="grid grid-cols-2 gap-2">
        <button
          type="submit"
          name="answer"
          value="accept"
          disabled={pending}
          className="bg-night px-4 py-3 text-sm font-medium tracking-wider text-white uppercase transition hover:bg-accent disabled:opacity-50"
        >
          Accept
        </button>
        <button
          type="submit"
          name="answer"
          value="decline"
          disabled={pending}
          className="border border-night px-4 py-3 text-sm font-medium tracking-wider uppercase transition hover:bg-line disabled:opacity-50"
        >
          Decline
        </button>
      </div>
      <FormMessage error={state.error} />
    </form>
  );
}

// Withdraw a waiting request, for the customer.
export function CancelRequestButton({ bookingId }: { bookingId: string }) {
  const [state, action, pending] = useActionState(cancelBooking, {});

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="booking_id" value={bookingId} />
      <button type="submit" disabled={pending} className="self-start text-sm text-red-700 hover:underline disabled:opacity-50">
        {pending ? "Cancelling..." : "Cancel this request"}
      </button>
      <FormMessage error={state.error} />
    </form>
  );
}
