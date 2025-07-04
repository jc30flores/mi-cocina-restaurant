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
              {t("El editor de mesas te permite crear y administrar el plano de tu restaurante. Puedes:")}
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
                    <CardTitle>{t("Información del Restaurante")}</CardTitle>
                    <CardDescription>
                      {t("Actualiza la información básica de tu restaurante")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t("Aquí podrás ingresar nombre, dirección y datos de contacto del restaurante")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("Horarios de Atención")}</CardTitle>
                    <CardDescription>
                      {t("Define los horarios de operación del restaurante")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t("Incluye horarios de operación, días festivos y horarios especiales")}
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
                    <CardTitle>{t("Métodos de Pago")}</CardTitle>
                    <CardDescription>
                      {t("Configura los métodos de pago aceptados")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t("Contendrá integraciones de pago y configuraciones de caja")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="staff">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Gestión de Personal")}</CardTitle>
                    <CardDescription>
                      {t("Administra a tus empleados y permisos")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t("Aquí podrás gestionar usuarios, roles y permisos")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Configuración de Notificaciones")}</CardTitle>
                    <CardDescription>
                      {t("Configura alertas y notificaciones")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t("Configuraciones para alertas, notificaciones y recordatorios")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="printers">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Configuración de Impresoras")}</CardTitle>
                    <CardDescription>
                      {t("Configura impresoras de recibos y cocina")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t("Conexiones de impresoras, plantillas y ajustes")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="language">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Idioma y Región")}</CardTitle>
                    <CardDescription>
                      {t("Configura el idioma y preferencias regionales")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t("Selecciona idioma, formatos de fecha y moneda")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="system">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Información del Sistema")}</CardTitle>
                    <CardDescription>
                      {t("Consulta detalles del sistema y realiza mantenimiento")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t("Información del sistema, opciones de respaldo y herramientas de mantenimiento")}
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
