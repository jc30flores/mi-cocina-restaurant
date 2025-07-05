import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { createEmployee } from "@/services/api";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  nombre: z.string().min(1, { message: "Requerido" }),
  cargo: z.string().min(1, { message: "Requerido" }),
  estado: z.enum(["active", "off"]).default("active"),
  horarioEntrada: z.string().optional(),
  horasTrabajadas: z.string().optional(),
  descanso: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEmployeeFormProps {
  onSuccess?: () => void;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      cargo: "",
      estado: "active",
      horarioEntrada: "",
      horasTrabajadas: "",
      descanso: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createEmployee({
        name: values.nombre,
        position: values.cargo,
        status: values.estado,
        hourly_rate: values.horasTrabajadas
          ? parseFloat(values.horasTrabajadas)
          : undefined,
        clock_in: values.horarioEntrada || undefined,
        break_start: values.descanso ? new Date().toISOString() : undefined,
      });
      toast({ title: t("Empleado guardado") });
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        title: t("Error"),
        description: t("No se pudo guardar el empleado"),
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Nombre")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cargo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Cargo")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Estado")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">{t("Activo")}</SelectItem>
                  <SelectItem value="off">{t("Inactivo")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="horarioEntrada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Horario de entrada")}</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="horasTrabajadas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Horas trabajadas")}</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descanso"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="m-0">{t("Descanso")}</FormLabel>
            </FormItem>
          )}
        />
        <Button type="submit">{t("Guardar Empleado")}</Button>
      </form>
    </Form>
  );
};

export default AddEmployeeForm;
