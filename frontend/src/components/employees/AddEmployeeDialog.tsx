
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { createEmployee, getEmployees } from "@/services/api";

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
// Use Label for non-hook-form labels (e.g., owner code validation)
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AddEmployeeDialogProps {
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
  accessCode: z.string().min(1, { message: "Access code is required" }),
});

const AddEmployeeDialog = ({ open, onOpenChange, onSuccess }: AddEmployeeDialogProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [ownerCode, setOwnerCode] = React.useState("");
  const [ownerValidated, setOwnerValidated] = React.useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      position: "",
      hourlyRate: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Convert hourly rate to number
      const hourlyRate = parseFloat(values.hourlyRate);
      
      // Insert employee into database
      // Create new employee via API
      await createEmployee({
        name: values.name,
        position: values.position,
        hourly_rate: hourlyRate,
        status: "off",
        access_code: values.accessCode
      });
      
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
      
      // Reset form
      form.reset();
      
      // Close dialog
      onOpenChange(false);
      
      // Callback for refreshing data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        {/* Owner code validation */}
        {!ownerValidated ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="owner-access-code">Owner Access Code</Label>
              <Input
                id="owner-access-code"
                type="password"
                value={ownerCode}
                onChange={(e) => setOwnerCode(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                onClick={async () => {
                  try {
                    const emps = await getEmployees();
                    const owner = emps.find((e: any) => e.position === 'owner' && e.access_code === ownerCode);
                    if (owner) {
                      toast({ title: 'Owner validated' });
                      setOwnerValidated(true);
                    } else {
                      toast({ title: 'Invalid code', variant: 'destructive' });
                    }
                  } catch (error) {
                    console.error(error);
                    toast({ title: 'Error validating code', variant: 'destructive' });
                  }
                }}
              >
                Validate
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Employee name" {...field} />
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
                    <Input placeholder="Employee position" {...field} />
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
                    <Input placeholder="10.50" type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accessCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 1020304" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit">Add Employee</Button>
            </DialogFooter>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
