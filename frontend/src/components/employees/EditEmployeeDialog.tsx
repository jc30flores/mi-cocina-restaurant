import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { getEmployees, updateEmployee } from "@/services/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { Employee } from "@/services/employee.service";

interface EditEmployeeDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  position: z.string().min(2, { message: "Position is required" }),
  hourlyRate: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Hourly rate must be a positive number",
  }),
  ownerCode: z.string().optional(),
});

const EditEmployeeDialog = ({ employee, open, onOpenChange, onSuccess }: EditEmployeeDialogProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  // When employee changes, reset owner validation state
  const [ownerValidated, setOwnerValidated] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      setOwnerValidated(false);
    }
  }, [open, employee]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: employee?.name || "",
      position: employee?.position || "",
      hourlyRate: employee ? String(employee.hourly_rate) : "",
      ownerCode: "",
    },
  });

  // Update default values when employee prop changes
  React.useEffect(() => {
    form.reset({
      name: employee?.name || "",
      position: employee?.position || "",
      hourlyRate: employee ? String(employee.hourly_rate) : "",
      ownerCode: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee]);

  const validateOwnerCode = async (code: string) => {
    // If we are editing the owner record itself and it has an access_code, compare directly
    if (employee?.position === "owner" && employee?.access_code) {
      return employee.access_code === code;
    }

    try {
      const emps = await getEmployees();
      const owner = emps.find((e: any) => e.position === "owner" && e.access_code === code);
      return Boolean(owner);
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!employee) return;

    // If owner was not validated yet, validate first
    if (!ownerValidated) {
      const ok = await validateOwnerCode(values.ownerCode);
      if (!ok) {
        toast({ title: "Invalid owner code", variant: "destructive" });
        return;
      }
      setOwnerValidated(true);
      // Clear ownerCode field so it doesn't appear in other inputs
      form.setValue("ownerCode", "");
      // Remove code field value to avoid sending it to backend
      return;
    }

    try {
      const hourlyRate = parseFloat(values.hourlyRate);

      await updateEmployee(employee.id, {
        name: values.name,
        position: values.position,
        hourly_rate: hourlyRate,
      });

      toast({ title: "Employee updated" });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>

        {!ownerValidated ? (
          <Form key="code-step" {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="ownerCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Access Code</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Validate</Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form key="edit-step" {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;
