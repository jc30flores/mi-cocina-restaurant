
import React from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useLanguage } from "@/context/LanguageContext";

// Sample data for charts
const salesData = [
  { name: "Lun", ventas: 4000, clientes: 240 },
  { name: "Mar", ventas: 3000, clientes: 198 },
  { name: "Mié", ventas: 2000, clientes: 120 },
  { name: "Jue", ventas: 2780, clientes: 180 },
  { name: "Vie", ventas: 4890, clientes: 280 },
  { name: "Sáb", ventas: 5390, clientes: 350 },
  { name: "Dom", ventas: 3490, clientes: 220 },
];

const categoryData = [
  { name: "Hamburguesas", value: 35 },
  { name: "Pizzas", value: 25 },
  { name: "Bebidas", value: 20 },
  { name: "Postres", value: 10 },
  { name: "Otros", value: 10 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const SalesDashboard = () => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleExport = () => {
    toast({
      title: t("Exportar Datos"),
      description: t("Informe exportado correctamente"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t("Ventas Totales")}</CardTitle>
            <CardDescription>{t("Hoy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$2,580.45</div>
            <p className="text-sm text-muted-foreground">+12.5% {t("vs ayer")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t("Ticket Promedio")}</CardTitle>
            <CardDescription>{t("Hoy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$32.25</div>
            <p className="text-sm text-muted-foreground">+4.3% {t("vs ayer")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t("Transacciones")}</CardTitle>
            <CardDescription>{t("Hoy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">80</div>
            <p className="text-sm text-muted-foreground">+8.1% {t("vs ayer")}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t("Ventas Semanales")}</CardTitle>
              <CardDescription>{t("Últimos 7 días")}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              {t("Exportar")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ventas" name={t("Ventas ($)")} fill="#3b82f6" />
                <Bar dataKey="clientes" name={t("Clientes")} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("Ventas por Categoría")}</CardTitle>
            <CardDescription>{t("Distribución de ventas")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t("Top Productos")}</CardTitle>
            <CardDescription>{t("Productos más vendidos")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Producto")}</TableHead>
                  <TableHead>{t("Cantidad")}</TableHead>
                  <TableHead className="text-right">{t("Ventas")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Hamburguesa Clásica</TableCell>
                  <TableCell>45</TableCell>
                  <TableCell className="text-right">$584.55</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Pizza Pepperoni</TableCell>
                  <TableCell>32</TableCell>
                  <TableCell className="text-right">$607.68</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Papas Fritas</TableCell>
                  <TableCell>62</TableCell>
                  <TableCell className="text-right">$309.38</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Refresco Cola</TableCell>
                  <TableCell>85</TableCell>
                  <TableCell className="text-right">$254.15</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const RevenueReport = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const handleExport = () => {
    toast({
      title: t("Exportar Datos"),
      description: t("Informe exportado correctamente"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={handleExport}>
          {t("Exportar a Excel")}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("Ingresos por Periodo")}</CardTitle>
          <CardDescription>{t("Ventas mensuales")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { mes: "Ene", ingresos: 18000, costos: 9000 },
                  { mes: "Feb", ingresos: 16000, costos: 8500 },
                  { mes: "Mar", ingresos: 20000, costos: 10000 },
                  { mes: "Abr", ingresos: 25000, costos: 12000 },
                  { mes: "May", ingresos: 28000, costos: 13000 },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ingresos" name={t("Ingresos")} stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="costos" name={t("Costos")} stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("Ingresos por Sucursal")}</CardTitle>
          <CardDescription>{t("Último mes")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { sucursal: "Centro", ingresos: 28000 },
                  { sucursal: "Norte", ingresos: 22000 },
                  { sucursal: "Sur", ingresos: 19000 },
                  { sucursal: "Este", ingresos: 24000 },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sucursal" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ingresos" name={t("Ingresos ($)")} fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("Resumen Financiero")}</CardTitle>
          <CardDescription>{t("Último mes")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Categoría")}</TableHead>
                <TableHead className="text-right">{t("Actual")}</TableHead>
                <TableHead className="text-right">{t("Anterior")}</TableHead>
                <TableHead className="text-right">{t("Diferencia")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{t("Ingresos Totales")}</TableCell>
                <TableCell className="text-right">$28,000.00</TableCell>
                <TableCell className="text-right">$26,500.00</TableCell>
                <TableCell className="text-right text-green-600">+5.66%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Costo de Ventas")}</TableCell>
                <TableCell className="text-right">$13,000.00</TableCell>
                <TableCell className="text-right">$12,500.00</TableCell>
                <TableCell className="text-right text-red-600">+4.00%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Margen Bruto")}</TableCell>
                <TableCell className="text-right">$15,000.00</TableCell>
                <TableCell className="text-right">$14,000.00</TableCell>
                <TableCell className="text-right text-green-600">+7.14%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Gastos Operativos")}</TableCell>
                <TableCell className="text-right">$10,000.00</TableCell>
                <TableCell className="text-right">$9,800.00</TableCell>
                <TableCell className="text-right text-red-600">+2.04%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Ganancia Neta")}</TableCell>
                <TableCell className="text-right">$5,000.00</TableCell>
                <TableCell className="text-right">$4,200.00</TableCell>
                <TableCell className="text-right text-green-600">+19.05%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const Reports = () => {
  const { t } = useLanguage();
  
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t("Reportes e Insights")}</h1>
        
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">{t("Dashboard")}</TabsTrigger>
            <TabsTrigger value="revenue">{t("Ingresos")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <SalesDashboard />
          </TabsContent>
          
          <TabsContent value="revenue">
            <RevenueReport />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Reports;
