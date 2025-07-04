
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { getEmployees, updateEmployeeStatus, addBreakRecord, updateBreakRecord, Employee } from "@/services/employee.service";
import { Plus, Pencil } from "lucide-react";
import AddEmployeeDialog from "@/components/employees/AddEmployeeDialog";
import EditEmployeeDialog from "@/components/employees/EditEmployeeDialog";
import BreakTimeTracker from "@/components/employees/BreakTimeTracker";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface EmployeesSubProps {
  onEdit: (employee: Employee) => void;
}

const ActiveEmployees: React.FC<EmployeesSubProps> = ({ onEdit }) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });
  
  const activeEmployees = employees.filter(e => e.status !== "off");

  const handleClockOut = async (id: string) => {
    try {
      const now = new Date().toISOString();
      
      // If employee is on break, end their break first
      const employee = activeEmployees.find(e => e.id === id);
      if (employee && employee.status === "break") {
        await updateEmployeeStatus(id, "off", undefined, now, undefined, now);
        await updateBreakRecord(id, now);
      } else {
        await updateEmployeeStatus(id, "off", undefined, now);
      }
      
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      
      toast({
        title: "Salida",
        description: "El empleado ha cerrado su turno exitosamente",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update employee status",
        variant: "destructive",
      });
    }
  };

  const handleStartBreak = async (id: string) => {
    try {
      const now = new Date().toISOString();
      await updateEmployeeStatus(id, "break", undefined, undefined, now);
      await addBreakRecord(id, now);
      
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      
      toast({
        title: "Break Started",
        description: "Employee has started a break",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to start break",
        variant: "destructive",
      });
    }
  };

  const handleEndBreak = async (id: string) => {
    try {
      const now = new Date().toISOString();
      await updateEmployeeStatus(id, "active", undefined, undefined, undefined, now);
      await updateBreakRecord(id, now);
      
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      
      toast({
        title: "Break Ended",
        description: "Employee has ended their break",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to end break",
        variant: "destructive",
      });
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-500 text-white">Active</Badge>;
      case "break":
        return <Badge variant="outline" className="bg-amber-500 text-white">Break</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-500 text-white">Inactive</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Employees</CardTitle>
        <CardDescription>Staff currently on shift</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Break Times</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeEmployees.length > 0 ? (
              activeEmployees.map((employee) => {
                const clockInTime = employee.clock_in ? new Date(employee.clock_in) : null;
                const now = new Date();
                const hoursWorked = clockInTime ? ((now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)).toFixed(1) : "0";
                const formattedClockIn = clockInTime ? clockInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
                
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{statusBadge(employee.status)}</TableCell>
                    <TableCell>{formattedClockIn}</TableCell>
                    <TableCell>{hoursWorked}</TableCell>
                    <TableCell>
                      <BreakTimeTracker
                        employeeId={employee.id}
                        status={employee.status}
                        breakStart={employee.break_start || null}
                        breakEnd={employee.break_end || null}
                        onStartBreak={handleStartBreak}
                        onEndBreak={handleEndBreak}
                      />
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onEdit(employee)}
                        title="Edit employee"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleClockOut(employee.id)}
                      >
                        Salida
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No active employees at this time
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const InactiveEmployees: React.FC<EmployeesSubProps> = ({ onEdit }) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });
  
  const inactiveEmployees = employees.filter(e => e.status === "off");

  const handleClockIn = async (id: string) => {
    try {
      const now = new Date().toISOString();
      await updateEmployeeStatus(id, "active", now);
      
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      
      toast({
        title: "Entrada",
        description: "El empleado ha iniciado su turno correctamente",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update employee status",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inactive Employees</CardTitle>
        <CardDescription>Staff available for shift</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Last Shift</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Last Break</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inactiveEmployees.length > 0 ? (
              inactiveEmployees.map((employee) => {
                const clockOutTime = employee.clock_out ? new Date(employee.clock_out) : null;
                const formattedLastShift = clockOutTime ? clockOutTime.toLocaleDateString() : "-";
                const lastBreakStart = employee.break_start ? new Date(employee.break_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-";
                const lastBreakEnd = employee.break_end ? new Date(employee.break_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-";
                
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{formattedLastShift}</TableCell>
                    <TableCell>${employee.hourly_rate.toFixed(2)}/hr</TableCell>
                    <TableCell>
                      {lastBreakStart !== "-" ? `${lastBreakStart} - ${lastBreakEnd}` : "-"}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onEdit(employee)}
                        title="Edit employee"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleClockIn(employee.id)}
                      >
                        Entrada
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No inactive employees at this time
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const TimeSheet = () => {
  const { t } = useLanguage();
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });
  
  // Get employees with clock in/out times for timesheet
  const employeesWithShifts = employees.filter(e => e.clock_in && e.clock_out);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Tracking</CardTitle>
        <CardDescription>Summary of hours and tips</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Break Start</TableHead>
              <TableHead>Break End</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employeesWithShifts.length > 0 ? (
              employeesWithShifts.map((employee) => {
                const clockInTime = employee.clock_in ? new Date(employee.clock_in) : null;
                const clockOutTime = employee.clock_out ? new Date(employee.clock_out) : null;
                const breakStartTime = employee.break_start ? new Date(employee.break_start) : null;
                const breakEndTime = employee.break_end ? new Date(employee.break_end) : null;
                
                let hoursWorked = 0;
                
                if (clockInTime && clockOutTime) {
                  // Calculate hours worked, subtracting break time if applicable
                  const totalMilliseconds = clockOutTime.getTime() - clockInTime.getTime();
                  let breakMilliseconds = 0;
                  
                  if (breakStartTime && breakEndTime) {
                    breakMilliseconds = breakEndTime.getTime() - breakStartTime.getTime();
                  }
                  
                  hoursWorked = (totalMilliseconds - breakMilliseconds) / (1000 * 60 * 60);
                }
                
                const total = hoursWorked * employee.hourly_rate;
                
                return (
                  <TableRow key={`${employee.id}-${employee.clock_out}`}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{clockOutTime?.toLocaleDateString()}</TableCell>
                    <TableCell>{clockInTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    <TableCell>{clockOutTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    <TableCell>{breakStartTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "-"}</TableCell>
                    <TableCell>{breakEndTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "-"}</TableCell>
                    <TableCell>{hoursWorked.toFixed(2)}</TableCell>
                    <TableCell>${total.toFixed(2)}</TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No completed time records
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const Employees = () => {
  const { t } = useLanguage();
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch employees on initial load
  const { isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });
  
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Employee Management</h1>
          
          <Button onClick={() => setAddEmployeeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <p>Loading...</p>
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="mb-6">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="timesheet">Time Tracking</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              <ActiveEmployees onEdit={(emp) => { setEditEmployee(emp); setEditEmployeeOpen(true); }} />
            </TabsContent>
            
            <TabsContent value="inactive">
              <InactiveEmployees onEdit={(emp) => { setEditEmployee(emp); setEditEmployeeOpen(true); }} />
            </TabsContent>
            
            <TabsContent value="timesheet">
              <TimeSheet />
            </TabsContent>
          </Tabs>
        )}
        
        <AddEmployeeDialog 
          open={addEmployeeOpen} 
          onOpenChange={setAddEmployeeOpen} 
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["employees"] })}
        />

        <EditEmployeeDialog
          employee={editEmployee}
          open={editEmployeeOpen}
          onOpenChange={(open) => {
            setEditEmployeeOpen(open);
            if (!open) setEditEmployee(null);
          }}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["employees"] })}
        />
      </div>
    </MainLayout>
  );
};

export default Employees;
