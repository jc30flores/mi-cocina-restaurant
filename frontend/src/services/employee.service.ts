
import {
  getEmployees as apiGetEmployees,
  updateEmployee,
  createBreakHistory,
  updateBreakHistory,
  getBreakHistory
} from "@/services/api";

export interface Employee {
  id: string;
  name: string;
  position: string;
  status: "active" | "off" | "break";
  clock_in?: string;
  clock_out?: string;
  break_start?: string; 
  break_end?: string;
  hourly_rate: number;
  access_code?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getEmployees(): Promise<Employee[]> {
  try {
    const data = await apiGetEmployees();
    return (data || []).map((employee: any) => {
      const status = ['active', 'off', 'break'].includes(employee.status)
        ? (employee.status as "active" | "off" | "break")
        : "off";
      return { ...employee, status } as Employee;
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
}

export async function updateEmployeeStatus(
  id: string, 
  status: string, 
  clockIn?: string, 
  clockOut?: string,
  breakStart?: string,
  breakEnd?: string
): Promise<void> {
  // Also validate the status parameter here
  const validStatus = ['active', 'off', 'break'].includes(status) ? status : "off";
  
  const updates: any = { 
    status: validStatus, 
    updated_at: new Date().toISOString() 
  };
  
  if (clockIn) {
    updates.clock_in = clockIn;
  }
  
  if (clockOut) {
    updates.clock_out = clockOut;
  }

  if (breakStart) {
    updates.break_start = breakStart;
  }

  if (breakEnd) {
    updates.break_end = breakEnd;
  }
  
  // Update employee via API
  await updateEmployee(id, updates);
}

export async function addBreakRecord(
  employeeId: string,
  breakStart: string,
  breakEnd?: string
): Promise<void> {
  const record = {
    employee_id: employeeId,
    break_start: breakStart,
    break_end: breakEnd || null,
    date: new Date().toISOString().split('T')[0]
  };

  // Create break record via API
  await createBreakHistory(record);
}

export async function updateBreakRecord(
  employeeId: string,
  breakEnd: string
): Promise<void> {
  // Find the most recent break record without an end time
  // Fetch open break record via API
  const data: any[] = await getBreakHistory(employeeId);
  if (data && data.length > 0) {
    // Update break end time via API
    await updateBreakHistory(data[0].id, { break_end: breakEnd });
  }
}

