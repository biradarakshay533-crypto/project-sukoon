import type { InputHTMLAttributes, ReactNode, Ref, TextareaHTMLAttributes } from "react";

const controlStyle =
  "rounded-xl border border-line bg-white px-4 py-3 text-base font-normal outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  ref?: Ref<HTMLInputElement>;
};

export function FormField({ label, name, ...inputProps }: FormFieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <input name={name} className={controlStyle} {...inputProps} />
    </label>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  name: string;
};

export function TextAreaField({ label, name, ...textareaProps }: TextAreaFieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <textarea name={name} rows={3} className={controlStyle} {...textareaProps} />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  children: ReactNode;
};

export function SelectField({ label, name, defaultValue, required, children }: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <select name={name} defaultValue={defaultValue} required={required} className={controlStyle}>
        {children}
      </select>
    </label>
  );
}

type SubmitButtonProps = {
  pending: boolean;
  label: string;
  pendingLabel: string;
};

export function SubmitButton({ pending, label, pendingLabel }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 rounded-lg bg-brand px-6 py-3.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </p>
    );
  }

  if (success) {
    return (
      <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
        {success}
      </p>
    );
  }

  return null;
}
