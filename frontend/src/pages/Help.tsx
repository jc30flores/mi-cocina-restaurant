
import React from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const FAQ = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Input
          placeholder="Buscar en preguntas frecuentes..."
          className="max-w-md"
        />
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            ¿Cómo agrego un nuevo producto al menú?
          </AccordionTrigger>
          <AccordionContent>
            Para agregar un nuevo producto, ve a la sección "Menú del Restaurante",
            haz clic en el botón "Agregar Producto", completa la información requerida
            y guarda los cambios. El nuevo producto estará disponible de inmediato en el POS.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2">
          <AccordionTrigger>
            ¿Cómo puedo dividir una cuenta entre varios clientes?
          </AccordionTrigger>
          <AccordionContent>
            En la pantalla del POS selecciona la orden que deseas dividir,
            luego haz clic en el botón "Pagar" y elige la opción "Dividir Cuenta".
            Puedes dividirla en partes iguales, por artículo o de forma personalizada.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3">
          <AccordionTrigger>
            ¿Cómo configuro los impuestos para diferentes productos?
          </AccordionTrigger>
          <AccordionContent>
            Ve a "Configuración", selecciona "General" y busca la sección "Impuestos".
            Puedes establecer tasas globales o específicas por categoría de producto.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-4">
          <AccordionTrigger>
            ¿Cómo puedo ver reportes de ventas de un periodo específico?
          </AccordionTrigger>
          <AccordionContent>
            Dirígete a la sección "Reportes e Insights", selecciona "Ingresos" y
            usa los filtros de fecha para elegir el periodo deseado.
            Puedes exportar los reportes en formato Excel o PDF.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-5">
          <AccordionTrigger>
            ¿Cómo registro la entrada y salida de los empleados?
          </AccordionTrigger>
          <AccordionContent>
            Ve a la sección "Gestión de Empleados", localiza al empleado en la lista
            y utiliza los botones "Entrada" o "Salida" según corresponda. También puedes
            registrar periodos de descanso.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const Tutorials = () => {
  const { toast } = useToast();
  
  const handleWatchVideo = (title: string) => {
    toast({
      title: "Reproduciendo tutorial",
      description: `"${title}" se abrirá en una nueva ventana`,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="overflow-hidden">
        <div className="aspect-video bg-muted relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => handleWatchVideo("Introducción al POS")}>
              Ver Video
            </Button>
          </div>
        </div>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Introducción al POS</CardTitle>
          <CardDescription>Aprende lo básico en 5 minutos</CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="aspect-video bg-muted relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => handleWatchVideo("Gestión de Ordenes")}>
              Ver Video
            </Button>
          </div>
        </div>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Gestión de Órdenes</CardTitle>
          <CardDescription>Crea, modifica y procesa órdenes</CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="aspect-video bg-muted relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => handleWatchVideo("Reportes Avanzados")}> 
              Ver Video
            </Button>
          </div>
        </div>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Reportes Avanzados</CardTitle>
          <CardDescription>Análisis de datos y métricas clave</CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="aspect-video bg-muted relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => handleWatchVideo("Gestión de Inventario")}>
              Ver Video
            </Button>
          </div>
        </div>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Gestión de Inventario</CardTitle>
          <CardDescription>Control de stock y alertas</CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="aspect-video bg-muted relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => handleWatchVideo("Programa de Lealtad")}>
              Ver Video
            </Button>
          </div>
        </div>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Programa de Lealtad</CardTitle>
          <CardDescription>Configuración de puntos y recompensas</CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="aspect-video bg-muted relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => handleWatchVideo("Integraciones Externas")}>
              Ver Video
            </Button>
          </div>
        </div>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Integraciones Externas</CardTitle>
          <CardDescription>Conecta con servicios de terceros</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

const Support = () => {
  const { toast } = useToast();
  
  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Solicitud enviada",
      description: "Nuestro equipo de soporte responderá pronto",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Centro de Soporte 24/7</CardTitle>
          <CardDescription>
            Nuestro equipo está disponible para ayudarte en cualquier momento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <h3 className="font-medium mb-2">Teléfono</h3>
              <p className="text-lg">+1 (800) 123-4567</p>
              <p className="text-sm text-muted-foreground">Disponible 24/7</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <h3 className="font-medium mb-2">Email</h3>
              <p className="text-lg">support@pos.com</p>
              <p className="text-sm text-muted-foreground">Respuesta en 2 horas</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <h3 className="font-medium mb-2">Chat en Vivo</h3>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => toast({
                  title: "Iniciando chat",
                  description: "Conectando con un agente de soporte...",
                })}
              >
                Iniciar Chat
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Enviar Solicitud de Soporte</h3>
            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <Input placeholder="Asunto" className="mb-2" />
                <textarea 
                  className="w-full min-h-[150px] p-3 border rounded-md" 
                  placeholder="Describe tu problema con detalle..."
                />
              </div>
              <Button type="submit">Enviar Solicitud</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Updates = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actualizaciones Recientes</CardTitle>
        <CardDescription>
          Mantente al día con las últimas actualizaciones y mejoras
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-lg">Version 2.5.3</h3>
              <Badge>New</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Lanzamiento: 28 de abril de 2025</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Mejoras a la interfaz del POS para mayor rapidez</li>
              <li>Corrección de errores en el módulo de reportes</li>
              <li>Nueva función de propina automática para grupos</li>
              <li>Mejoras generales de rendimiento</li>
            </ul>
          </div>
          
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-lg">Version 2.5.1</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Lanzamiento: 15 de abril de 2025</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Integración con nuevos proveedores de pago</li>
              <li>Mejoras al sistema de fidelización de clientes</li>
              <li>Optimización del módulo de inventario</li>
              <li>Nuevas opciones de personalización de recibos</li>
            </ul>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-lg">Version 2.4.8</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Lanzamiento: 1 de abril de 2025</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Nueva función mejorada de división de cuentas</li>
              <li>Soporte para múltiples idiomas</li>
              <li>Corrección de errores en pedidos en línea</li>
              <li>Mejoras en la seguridad del sistema</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Help = () => {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Centro de Ayuda y Soporte</h1>
        
        <Tabs defaultValue="faq">
          <TabsList className="mb-6">
            <TabsTrigger value="faq">Preguntas Frecuentes</TabsTrigger>
            <TabsTrigger value="tutorials">Tutoriales</TabsTrigger>
            <TabsTrigger value="support">Soporte Técnico</TabsTrigger>
            <TabsTrigger value="updates">Actualizaciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq">
            <FAQ />
          </TabsContent>
          
          <TabsContent value="tutorials">
            <Tutorials />
          </TabsContent>
          
          <TabsContent value="support">
            <Support />
          </TabsContent>
          
          <TabsContent value="updates">
            <Updates />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Help;
