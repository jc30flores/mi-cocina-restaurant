
import React, { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

const HardwarePanel = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isPrinterConnected, setIsPrinterConnected] = useState(true);
  const [isCashDrawerOpen, setIsCashDrawerOpen] = useState(false);
  const [isCardReaderConnected, setIsCardReaderConnected] = useState(true);
  
  const handlePrinterToggle = () => {
    setIsPrinterConnected(!isPrinterConnected);
    toast({
      title: isPrinterConnected ? t("Impresora desconectada") : t("Impresora conectada"),
      description: isPrinterConnected ? t("La impresora ha sido desconectada") : t("La impresora está lista para imprimir"),
    });
  };
  
  const handlePrintTest = () => {
    if (isPrinterConnected) {
      toast({
        title: t("Impresión de prueba"),
        description: t("Se ha enviado una página de prueba a la impresora"),
      });
    } else {
      toast({
        title: t("Error"),
        description: t("La impresora no está conectada"),
        variant: "destructive",
      });
    }
  };
  
  const handleOpenCashDrawer = () => {
    setIsCashDrawerOpen(true);
    toast({
      title: t("Cajón abierto"),
      description: t("El cajón de efectivo ha sido abierto"),
    });
    
    setTimeout(() => {
      setIsCashDrawerOpen(false);
    }, 3000);
  };
  
  const handleCardReaderToggle = () => {
    setIsCardReaderConnected(!isCardReaderConnected);
    toast({
      title: isCardReaderConnected ? t("Lector desconectado") : t("Lector conectado"),
      description: isCardReaderConnected ? t("El lector de tarjetas ha sido desconectado") : t("El lector de tarjetas está listo para usar"),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("Impresora de Recibos")}</CardTitle>
          <CardDescription>
            {t("Gestione su impresora de recibos térmica")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="printer">{t("Estado de la impresora")}</Label>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isPrinterConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{isPrinterConnected ? t("Conectada") : t("Desconectada")}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="printer-toggle">{t("Conectar/Desconectar")}</Label>
            <Switch 
              id="printer-toggle" 
              checked={isPrinterConnected} 
              onCheckedChange={handlePrinterToggle} 
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={handlePrintTest}
            disabled={!isPrinterConnected}
          >
            {t("Imprimir Página de Prueba")}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("Cajón de Efectivo")}</CardTitle>
          <CardDescription>
            {t("Controle su cajón de efectivo")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t("Estado del cajón")}</Label>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isCashDrawerOpen ? 'bg-amber-500' : 'bg-green-500'}`}></div>
              <span className="text-sm">{isCashDrawerOpen ? t("Abierto") : t("Cerrado")}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleOpenCashDrawer} disabled={isCashDrawerOpen}>
            {t("Abrir Cajón")}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("Lector de Tarjetas")}</CardTitle>
          <CardDescription>
            {t("Configure su lector de tarjetas")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t("Estado del lector")}</Label>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isCardReaderConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{isCardReaderConnected ? t("Conectado") : t("Desconectado")}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="reader-toggle">{t("Conectar/Desconectar")}</Label>
            <Switch 
              id="reader-toggle" 
              checked={isCardReaderConnected} 
              onCheckedChange={handleCardReaderToggle} 
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline"
            onClick={() => toast({
              title: t("Lector de tarjetas"),
              description: t("Prueba de conexión completada con éxito"),
            })}
            disabled={!isCardReaderConnected}
          >
            {t("Probar Conexión")}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("Pantalla de Cliente")}</CardTitle>
          <CardDescription>
            {t("Configure la pantalla orientada al cliente")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t("Estado de la pantalla")}</Label>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">{t("Conectada")}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="display-brightness">{t("Brillo")}</Label>
            <input
              type="range"
              id="display-brightness"
              min="0"
              max="100"
              defaultValue="80"
              className="w-1/2"
              onChange={() => toast({
                title: t("Brillo ajustado"),
                description: t("El brillo de la pantalla ha sido ajustado"),
              })}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline"
            onClick={() => toast({
              title: t("Pantalla de cliente"),
              description: t("Prueba de visualización completada con éxito"),
            })}
          >
            {t("Probar Pantalla")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const KioskMode = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isKioskEnabled, setIsKioskEnabled] = useState(false);

  const handleKioskToggle = () => {
    setIsKioskEnabled(!isKioskEnabled);
    toast({
      title: isKioskEnabled ? t("Modo quiosco desactivado") : t("Modo quiosco activado"),
      description: isKioskEnabled ? t("Ha salido del modo quiosco") : t("Ha entrado en modo quiosco"),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Modo Quiosco")}</CardTitle>
        <CardDescription>
          {t("Configure el modo de quiosco de autoservicio")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="kiosk-toggle">{t("Activar modo quiosco")}</Label>
          <Switch 
            id="kiosk-toggle" 
            checked={isKioskEnabled} 
            onCheckedChange={handleKioskToggle} 
          />
        </div>
        
        {isKioskEnabled && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">{t("Opciones del Quiosco")}</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="self-checkout">{t("Permitir auto-pago")}</Label>
                  <Switch 
                    id="self-checkout" 
                    defaultChecked 
                    onCheckedChange={() => toast({
                      title: t("Configuración guardada"),
                      description: t("La configuración de auto-pago ha sido actualizada"),
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="order-modifications">{t("Permitir modificaciones")}</Label>
                  <Switch 
                    id="order-modifications" 
                    defaultChecked 
                    onCheckedChange={() => toast({
                      title: t("Configuración guardada"),
                      description: t("La configuración de modificaciones ha sido actualizada"),
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="cash-payment">{t("Permitir pago en efectivo")}</Label>
                  <Switch 
                    id="cash-payment" 
                    onCheckedChange={() => toast({
                      title: t("Configuración guardada"),
                      description: t("La configuración de pago en efectivo ha sido actualizada"),
                    })}
                  />
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full"
              onClick={() => {
                toast({
                  title: t("Vista previa"),
                  description: t("Cargando vista previa del modo quiosco..."),
                });
              }}
            >
              {t("Previsualizar Modo Quiosco")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Hardware = () => {
  const { t } = useLanguage();
  
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t("Simulación de Hardware")}</h1>
        
        <Tabs defaultValue="hardware">
          <TabsList className="mb-6">
            <TabsTrigger value="hardware">{t("Hardware POS")}</TabsTrigger>
            <TabsTrigger value="kiosk">{t("Modo Quiosco")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hardware">
            <HardwarePanel />
          </TabsContent>
          
          <TabsContent value="kiosk">
            <KioskMode />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Hardware;
