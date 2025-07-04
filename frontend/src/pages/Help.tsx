
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
          placeholder="Search in frequently asked questions..." 
          className="max-w-md"
        />
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            How do I add a new product to the menu?
          </AccordionTrigger>
          <AccordionContent>
            To add a new product, go to the "Restaurant Menu" section, 
            click on the "Add Product" button, complete the required details 
            and save the changes. The new product will be available immediately in the POS.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2">
          <AccordionTrigger>
            How can I split a bill between multiple customers?
          </AccordionTrigger>
          <AccordionContent>
            On the POS screen, select the order you want to split, 
            then click on the "Pay" button and select the "Split Bill" option. 
            You can choose to split equally, by item, or custom.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3">
          <AccordionTrigger>
            How do I configure taxes for different products?
          </AccordionTrigger>
          <AccordionContent>
            Go to "Settings", select "General" and find the "Taxes" section. 
            You can set up global tax rates or specific rates by product category.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-4">
          <AccordionTrigger>
            How can I view sales reports for a specific period?
          </AccordionTrigger>
          <AccordionContent>
            Go to the "Reports & Insights" section, select "Revenue" and 
            use the date filters to select the desired period. 
            You can export the reports in Excel or PDF format.
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-5">
          <AccordionTrigger>
            How do I record employee clock in and out?
          </AccordionTrigger>
          <AccordionContent>
            Go to the "Employee Management" section, find the employee in the list 
            and use the "Clock In" or "Clock Out" buttons as appropriate. You can also 
            record break periods.
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
      title: "Playing tutorial",
      description: `"${title}" will open in a new window`,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="overflow-hidden">
        <div className="aspect-video bg-muted relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => handleWatchVideo("Introduction to POS")}>
              Watch Video
            </Button>
          </div>
        </div>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Introduction to POS</CardTitle>
          <CardDescription>Learn the basics in 5 minutes</CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="aspect-video bg-muted relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => handleWatchVideo("Order Management")}>
              Watch Video
            </Button>
          </div>
        </div>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Order Management</CardTitle>
          <CardDescription>Create, modify and process orders</CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="aspect-video bg-muted relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => handleWatchVideo("Advanced Reports")}>
              Watch Video
            </Button>
          </div>
        </div>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Advanced Reports</CardTitle>
          <CardDescription>Data analysis and key metrics</CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="aspect-video bg-muted relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => handleWatchVideo("Inventory Management")}>
              Watch Video
            </Button>
          </div>
        </div>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Inventory Management</CardTitle>
          <CardDescription>Stock control and alerts</CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="aspect-video bg-muted relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => handleWatchVideo("Loyalty Program")}>
              Watch Video
            </Button>
          </div>
        </div>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">Loyalty Program</CardTitle>
          <CardDescription>Points and rewards configuration</CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="overflow-hidden">
        <div className="aspect-video bg-muted relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => handleWatchVideo("External Integrations")}>
              Watch Video
            </Button>
          </div>
        </div>
        <CardHeader className="py-3">
          <CardTitle className="text-lg">External Integrations</CardTitle>
          <CardDescription>Connect with third-party services</CardDescription>
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
      title: "Request sent",
      description: "Our support team will respond shortly",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>24/7 Support Center</CardTitle>
          <CardDescription>
            Our team is available to help you anytime
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <h3 className="font-medium mb-2">Phone</h3>
              <p className="text-lg">+1 (800) 123-4567</p>
              <p className="text-sm text-muted-foreground">Available 24/7</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <h3 className="font-medium mb-2">Email</h3>
              <p className="text-lg">support@pos.com</p>
              <p className="text-sm text-muted-foreground">Response within 2 hours</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <h3 className="font-medium mb-2">Live Chat</h3>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => toast({
                  title: "Starting chat",
                  description: "Connecting with a support agent...",
                })}
              >
                Start Chat
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Send Support Request</h3>
            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <Input placeholder="Subject" className="mb-2" />
                <textarea 
                  className="w-full min-h-[150px] p-3 border rounded-md" 
                  placeholder="Describe your problem in detail..."
                />
              </div>
              <Button type="submit">Send Request</Button>
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
        <CardTitle>Recent Updates</CardTitle>
        <CardDescription>
          Stay up to date with the latest updates and improvements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-lg">Version 2.5.3</h3>
              <Badge>New</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Released: April 28, 2025</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Improvements to POS interface for better speed</li>
              <li>Bug fixes in the reports module</li>
              <li>New automatic gratuity function for groups</li>
              <li>General performance improvements</li>
            </ul>
          </div>
          
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-lg">Version 2.5.1</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Released: April 15, 2025</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Integration with new payment providers</li>
              <li>Improvements to customer loyalty system</li>
              <li>Inventory module optimization</li>
              <li>New receipt customization options</li>
            </ul>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-lg">Version 2.4.8</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">Released: April 1, 2025</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>New improved bill splitting function</li>
              <li>Support for multiple languages</li>
              <li>Bug fixes in online orders</li>
              <li>System security improvements</li>
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
        <h1 className="text-3xl font-bold mb-6">Help and Support Center</h1>
        
        <Tabs defaultValue="faq">
          <TabsList className="mb-6">
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="support">Technical Support</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
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
