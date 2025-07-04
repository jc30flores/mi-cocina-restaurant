
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
        title: t("Registro de Salida"),
        description: t("El empleado ha registrado su salida correctamente"),
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t("Error"),
        description: t("Failed to update employee status"),
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
        title: t("Descanso iniciado"),
        description: t("El empleado ha iniciado su descanso"),
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t("Error"),
        description: t("Failed to start break"),
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
        title: t("Descanso finalizado"),
        description: t("El empleado ha finalizado su descanso"),
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t("Error"),
        description: t("Failed to end break"),
        variant: "destructive",
      });
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-500 text-white">{t("Activo")}</Badge>;
      case "break":
        return <Badge variant="outline" className="bg-amber-500 text-white">{t("Break")}</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-500 text-white">{t("Inactivo")}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Empleados Activos")}</CardTitle>
        <CardDescription>{t("Personal actualmente en turno")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Nombre")}</TableHead>
              <TableHead>{t("Cargo")}</TableHead>
              <TableHead>{t("Estado")}</TableHead>
              <TableHead>{t("Entrada")}</TableHead>
              <TableHead>{t("Horas")}</TableHead>
              <TableHead>{t("Descanso")}</TableHead>
              <TableHead className="text-center">{t("Acción")}</TableHead>
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
                        title={t("Edit employee")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleClockOut(employee.id)}
                      >
                        {t("Salida")}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  {t("No active employees at this time")}
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
        title: t("Registro de Entrada"),
        description: t("El empleado ha registrado su entrada correctamente"),
      });
    } catch (error) {
      console.error(error);
      toast({
        title: t("Error"),
        description: t("Failed to update employee status"),
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Empleados Inactivos")}</CardTitle>
        <CardDescription>{t("Personal disponible para turno")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Nombre")}</TableHead>
              <TableHead>{t("Cargo")}</TableHead>
              <TableHead>{t("Último Turno")}</TableHead>
              <TableHead>{t("Tarifa")}</TableHead>
              <TableHead>{t("Último Descanso")}</TableHead>
              <TableHead className="text-center">{t("Acción")}</TableHead>
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
                        title={t("Edit employee")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleClockIn(employee.id)}
                      >
                        {t("Entrada")}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  {t("No inactive employees at this time")}
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
        <CardTitle>{t("Control Horario")}</CardTitle>
        <CardDescription>{t("Resumen de horas y propinas")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Nombre")}</TableHead>
              <TableHead>{t("Fecha")}</TableHead>
              <TableHead>{t("Entrada")}</TableHead>
              <TableHead>{t("Salida")}</TableHead>
              <TableHead>{t("Inicio Descanso")}</TableHead>
              <TableHead>{t("Fin Descanso")}</TableHead>
              <TableHead>{t("Horas")}</TableHead>
              <TableHead>{t("Total")}</TableHead>
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
                  {t("No hay registros de horario completados")}
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
          <h1 className="text-3xl font-bold">{t("Gestión de Empleados")}</h1>

          <Button onClick={() => setAddEmployeeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("Agregar Empleado")}
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <p>{t("Cargando...")}</p>
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="mb-6">
              <TabsTrigger value="active">{t("Activos")}</TabsTrigger>
              <TabsTrigger value="inactive">{t("Inactivos")}</TabsTrigger>
              <TabsTrigger value="timesheet">{t("Control Horario")}</TabsTrigger>
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
