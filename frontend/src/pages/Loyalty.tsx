
import React from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

const LoyaltyProgram = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t("Búsqueda de cliente"),
      description: t("Funcionalidad en desarrollo"),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{t("Buscar Cliente")}</CardTitle>
          <CardDescription>{t("Busque por nombre o teléfono")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">{t("Buscar cliente")}</Label>
              <Input id="search" placeholder={t("Nombre, teléfono o email")} />
            </div>
            <Button type="submit" className="w-full">{t("Buscar")}</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t("Perfil Cliente")}</CardTitle>
          <CardDescription>Juan Pérez</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-md font-medium">{t("Puntos acumulados")}</div>
              <div className="text-3xl font-bold">750</div>
              <div className="text-sm text-muted-foreground">{t("de 1000 para recompensa")}</div>
            </div>
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-primary/10 border-4 border-primary text-2xl font-bold text-primary">
              75%
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{t("Progreso hacia próxima recompensa")}</span>
              <span>750/1000</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">{t("Nivel")}</div>
              <div className="font-semibold">Gold</div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">{t("Descuento")}</div>
              <div className="font-semibold">10%</div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">{t("Último pedido")}</div>
              <div className="font-semibold">15/04/2025</div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-sm text-muted-foreground">{t("Total gastado")}</div>
              <div className="font-semibold">$325.75</div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => toast({
            title: t("Recompensas"),
            description: t("Funcionalidad en desarrollo"),
          })}>
            {t("Redimir Recompensa")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const GiftCards = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const handleActivateCard = () => {
    toast({
      title: t("Tarjeta Activada"),
      description: t("La tarjeta de regalo ha sido activada correctamente"),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{t("Activar Tarjeta")}</CardTitle>
          <CardDescription>{t("Escanee o introduzca el código")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">{t("Número de Tarjeta")}</Label>
              <Input id="card-number" placeholder="GC-XXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">{t("Monto")}</Label>
              <Input id="amount" type="number" placeholder="50.00" />
            </div>
            <Button type="button" onClick={handleActivateCard} className="w-full">{t("Activar")}</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t("Tarjetas Activas")}</CardTitle>
          <CardDescription>{t("Gestión de tarjetas de regalo")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Número")}</TableHead>
                <TableHead>{t("Fecha")}</TableHead>
                <TableHead>{t("Monto Original")}</TableHead>
                <TableHead>{t("Balance")}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">GC-12345678</TableCell>
                <TableCell>10/04/2025</TableCell>
                <TableCell>$50.00</TableCell>
                <TableCell>$35.50</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => toast({
                    title: t("Checar balance"),
                    description: t("Funcionalidad en desarrollo"),
                  })}>
                    {t("Verificar")}
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">GC-23456789</TableCell>
                <TableCell>12/04/2025</TableCell>
                <TableCell>$100.00</TableCell>
                <TableCell>$100.00</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => toast({
                    title: t("Checar balance"),
                    description: t("Funcionalidad en desarrollo"),
                  })}>
                    {t("Verificar")}
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">GC-34567890</TableCell>
                <TableCell>15/04/2025</TableCell>
                <TableCell>$25.00</TableCell>
                <TableCell>$0.00</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => toast({
                    title: t("Checar balance"),
                    description: t("Funcionalidad en desarrollo"),
                  })}>
                    {t("Verificar")}
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const Campaigns = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const handleCreateCampaign = () => {
    toast({
      title: t("Campaña creada"),
      description: t("La campaña se ha creado correctamente"),
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{t("Nueva Campaña")}</CardTitle>
          <CardDescription>{t("Configure una nueva campaña de marketing")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">{t("Nombre de Campaña")}</Label>
              <Input id="campaign-name" placeholder={t("Nombre de la campaña")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-type">{t("Tipo de Campaña")}</Label>
              <select className="w-full p-2 rounded-md border border-input" id="campaign-type">
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">{t("Notificación Push")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-date">{t("Fecha de Envío")}</Label>
              <Input id="campaign-date" type="date" />
            </div>
            <Button type="button" onClick={handleCreateCampaign} className="w-full">
              {t("Crear Campaña")}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>{t("Campañas Recientes")}</CardTitle>
          <CardDescription>{t("Historial y estadísticas de campañas")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Nombre")}</TableHead>
                <TableHead>{t("Tipo")}</TableHead>
                <TableHead>{t("Fecha")}</TableHead>
                <TableHead>{t("Enviados")}</TableHead>
                <TableHead>{t("Abiertos")}</TableHead>
                <TableHead>{t("Conversión")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{t("Promoción de Verano")}</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>01/04/2025</TableCell>
                <TableCell>500</TableCell>
                <TableCell>320 (64%)</TableCell>
                <TableCell>45 (9%)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Descuento Fin de Semana")}</TableCell>
                <TableCell>SMS</TableCell>
                <TableCell>10/04/2025</TableCell>
                <TableCell>250</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>32 (12.8%)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Nuevo Menú")}</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>15/04/2025</TableCell>
                <TableCell>750</TableCell>
                <TableCell>480 (64%)</TableCell>
                <TableCell>60 (8%)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const Loyalty = () => {
  const { t } = useLanguage();
  
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t("Fidelización y Regalos")}</h1>
        
        <Tabs defaultValue="loyalty">
          <TabsList className="mb-6">
            <TabsTrigger value="loyalty">{t("Programa de Puntos")}</TabsTrigger>
            <TabsTrigger value="giftcards">{t("Tarjetas de Regalo")}</TabsTrigger>
            <TabsTrigger value="campaigns">{t("Campañas de Email")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="loyalty">
            <LoyaltyProgram />
          </TabsContent>
          
          <TabsContent value="giftcards">
            <GiftCards />
          </TabsContent>
          
          <TabsContent value="campaigns">
            <Campaigns />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Loyalty;
