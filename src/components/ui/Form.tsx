import {
  FormProvider,
  useForm,
  type UseFormReturn,
  type FieldValues,
  type DefaultValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, type FormEvent } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyZodSchema = any;

interface FormProps<T extends FieldValues> {
  schema: AnyZodSchema;
  defaultValues?: DefaultValues<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: (form: UseFormReturn<T>) => ReactNode;
  className?: string;
}

/**
 * Form — combines useForm + zodResolver + FormProvider in one.
 *
 * Usage:
 *   const schema = z.object({
 *     email:    z.string().email('Invalid email'),
 *     password: z.string().min(8, 'Min 8 characters'),
 *   })
 *
 *   <Form schema={schema} onSubmit={handleLogin}>
 *     {({ formState }) => (
 *       <>
 *         <FormField name="email"    label="Email"    type="email" />
 *         <FormField name="password" label="Password" type="password" />
 *         <Button loading={formState.isSubmitting}>Sign in</Button>
 *       </>
 *     )}
 *   </Form>
 */
export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: FormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className={className} noValidate>
        {children(form)}
      </form>
    </FormProvider>
  );
}