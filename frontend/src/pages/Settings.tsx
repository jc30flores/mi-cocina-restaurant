import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Settings as SettingsIcon, Building, CreditCard, Users, Bell, Map, Printer, Languages, Database } from "lucide-react";
import { TableMapEditor } from "@/components/TableMap/TableMapEditor";
import { useLanguage } from "@/context/LanguageContext";

// Import and use the framer-motion library
import { motion } from "framer-motion";

const TableLayoutSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("Gestión de Mesas")}</CardTitle>
          <CardDescription>
            {t("Configura el plano y asignación de mesas")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              The table layout editor allows you to create and manage your restaurant floor plan. You can:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground pl-4 space-y-1">
              <li>{t("Agregar, editar y eliminar mesas")}</li>
              <li>{t("Crear y administrar secciones")}</li>
              <li>{t("Posicionar mesas en el plano")}</li>
              <li>{t("Establecer propiedades de mesa")}</li>
            </ul>
            <div className="pt-4">
              <Button
                onClick={() => navigate("/tables/editor")}
                className="w-full sm:w-auto"
              >
                <Map className="mr-2 h-4 w-4" />
                {t("Abrir Editor de Mesas")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Settings = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = React.useState("restaurant");

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <PageHeader title={t("Configuración")} className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="text-muted-foreground">{t("Configura tu sistema POS")}</p>
          </div>
        </PageHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-auto scrollbar-none pb-2">
            <TabsList className="mb-8">
              <TabsTrigger value="restaurant" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>{t("Restaurante")}</span>
              </TabsTrigger>
              <TabsTrigger value="tables" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                <span>{t("Mesas")}</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>{t("Pagos")}</span>
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{t("Personal")}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>{t("Notificaciones")}</span>
              </TabsTrigger>
              <TabsTrigger value="printers" className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                <span>{t("Impresoras")}</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <span>{t("Idioma")}</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>{t("Sistema")}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="restaurant">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Restaurant Information</CardTitle>
                    <CardDescription>
                      Update your restaurant's basic information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This section will contain fields for restaurant name, address, contact info, etc.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Business Hours</CardTitle>
                    <CardDescription>
                      Set your restaurant's operating hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This section will contain settings for operating hours, holidays, special schedules, etc.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tables">
              <TableLayoutSection />
            </TabsContent>

            <TabsContent value="payment">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Configure accepted payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This section will contain payment gateway integrations, cash settings, etc.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="staff">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Staff Management</CardTitle>
                    <CardDescription>
                      Manage your employees and permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This section will contain user management, role settings, permissions, etc.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Configure alerts and notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This section will contain settings for alerts, notifications, and reminders.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="printers">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Printer Setup</CardTitle>
                    <CardDescription>
                      Configure receipt and kitchen printers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This section will contain printer connections, templates, and settings.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="language">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Language & Locale</CardTitle>
                    <CardDescription>
                      Set language and regional preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This section will contain language selection, date formats, currency settings, etc.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="system">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Information</CardTitle>
                    <CardDescription>
                      View system details and perform maintenance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This section will contain system info, backup options, and maintenance tools.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
