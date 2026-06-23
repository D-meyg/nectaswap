import {
  useFormContext,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "../forms/Input";
import {Select} from "../forms/Select";
import { Text } from "@/components/ui/Text";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

/**
 * FormField — connects react-hook-form + zod validation to Input/Select.
 *
 * Why: without this, every form manually wires register(), errors, and
 * error messages. FormField reads from context automatically.
 *
 * Requires: wrap your form in <FormProvider> from react-hook-form.
 *
 * Usage (Input):
 *   <FormField name="email" label="Email Address" type="email"
 *     placeholder="admin@nectaswap.com" leftIcon={<Mail size={14} />} />
 *
 * Usage (Select):
 *   <FormField name="tier" label="KYC Tier" as="select"
 *     options={[{ value: 'Tier 1', label: 'Tier 1' }]} />
 *
 * Usage (custom render):
 *   <FormField name="code">
 *     {({ field, error }) => <OTPInput {...field} error={error} />}
 *   </FormField>
 */

// ── Generic field wrapper ─────────────────────────────────
interface FormFieldBaseProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  hint?: string;
  className?: string;
}

// Input variant
interface FormFieldInputProps<
  T extends FieldValues,
> extends FormFieldBaseProps<T> {
  as?: "input";
  type?: string;
  placeholder?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// Select variant
interface FormFieldSelectProps<
  T extends FieldValues,
> extends FormFieldBaseProps<T> {
  as: "select";
  options: { value: string; label: string }[];
  placeholder?: string;
}

// Custom render variant
interface FormFieldRenderProps<
  T extends FieldValues,
> extends FormFieldBaseProps<T> {
  as?: "custom";
  children: (ctx: { field: object; error?: string }) => ReactNode;
}

type FormFieldProps<T extends FieldValues> =
  | FormFieldInputProps<T>
  | FormFieldSelectProps<T>
  | FormFieldRenderProps<T>;

export function FormField<T extends FieldValues = FieldValues>({
  name,
  label,
  hint,
  className,
  ...rest
}: FormFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  // Navigate nested error paths (e.g. "address.city")
  const error = String(name || "").split(".").reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (acc: any, key) => acc?.[key],
    errors,
  )?.message as string | undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        // Custom render
        if ("children" in rest && typeof rest.children === "function") {
          return (
            <div className={cn("flex flex-col gap-1.5", className)}>
              {rest.children({ field, error })}
              {error && (
                <Text variant="micro" color="danger">
                  {error}
                </Text>
              )}
              {hint && !error && (
                <Text variant="micro" color="muted">
                  {hint}
                </Text>
              )}
            </div>
          );
        }

        // Select
        if ("as" in rest && rest.as === "select") {
          const { options, placeholder } = rest as FormFieldSelectProps<T>;
          return (
            <Select
              {...field}
              label={label}
              error={error}
              hint={hint}
              options={options}
              placeholder={placeholder}
              className={className}
            />
          );
        }

        // Default: Input
        const { type, placeholder, leftIcon, rightIcon } =
          rest as FormFieldInputProps<T>;
        return (
          <Input
            {...field}
            label={label}
            error={error}
            hint={hint}
            type={type}
            placeholder={placeholder}
            leftIcon={leftIcon}
            rightIcon={rightIcon}
            className={className}
          />
        );
      }}
    />
  );
}
