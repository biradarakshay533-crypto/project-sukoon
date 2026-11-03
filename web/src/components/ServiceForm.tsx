"use client";

import { useActionState } from "react";
import { saveService } from "@/lib/spa-actions";
import {
  FormField,
  FormMessage,
  SelectField,
  SubmitButton,
  TextAreaField,
} from "@/components/FormField";

type ServiceFormProps = {
  spaId: string;
  massageTypes: { id: string; name: string }[];
  service?: {
    id: string;
    name: string;
    description: string | null;
    massage_type_id: string | null;
    duration_minutes: number;
    price_paise: number;
    is_active: boolean;
  };
};

export function ServiceForm({ spaId, massageTypes, service }: ServiceFormProps) {
  const [state, action, pending] = useActionState(saveService, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="spa_id" value={spaId} />
      {service && <input type="hidden" name="service_id" value={service.id} />}
      <FormField label="Service name" name="name" defaultValue={service?.name} required />
      <SelectField
        label="Massage type"
        name="massage_type_id"
        defaultValue={service?.massage_type_id ?? ""}
        required
      >
        <option value="" disabled>
          Choose a type
        </option>
        {massageTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </SelectField>
      <TextAreaField
        label="Description"
        name="description"
        defaultValue={service?.description ?? ""}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Duration (minutes)"
          name="duration_minutes"
          type="number"
          min={1}
          step={1}
          defaultValue={service?.duration_minutes ?? 60}
          required
        />
        <FormField
          label="Price (₹)"
          name="price"
          type="number"
          min={1}
          step={1}
          defaultValue={service ? service.price_paise / 100 : ""}
          required
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={service?.is_active ?? true}
          className="size-4 accent-brand"
        />
        Show this service to customers
      </label>
      <FormMessage error={state.error} success={state.success} />
      <SubmitButton
        pending={pending}
        label={service ? "Save service" : "Add service"}
        pendingLabel="Saving..."
      />
    </form>
  );
}
