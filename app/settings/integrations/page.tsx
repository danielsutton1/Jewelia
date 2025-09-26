import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IntegrationCard } from "@/components/integrations/integration-card"

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Integrations</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Connect your Jewelia CRM with third-party services</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 sm:mb-6 grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2 overflow-x-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm min-h-[44px]">All</TabsTrigger>
          <TabsTrigger value="accounting" className="text-xs sm:text-sm min-h-[44px]">Accounting</TabsTrigger>
          <TabsTrigger value="ecommerce" className="text-xs sm:text-sm min-h-[44px]">E-commerce</TabsTrigger>
          <TabsTrigger value="email" className="text-xs sm:text-sm min-h-[44px]">Email</TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs sm:text-sm min-h-[44px]">Calendar</TabsTrigger>
          <TabsTrigger value="shipping" className="text-xs sm:text-sm min-h-[44px]">Shipping</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 sm:space-y-6">
          <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <IntegrationCard
              title="QuickBooks"
              description="Connect your QuickBooks account to sync financial data"
              category="Accounting"
              icon="/integrations/quickbooks.png"
              status="connected"
            />
            <IntegrationCard
              title="Xero"
              description="Sync your Xero accounting data with Jewelia CRM"
              category="Accounting"
              icon="/integrations/xero.png"
              status="not-connected"
            />
            <IntegrationCard
              title="Shopify"
              description="Import your Shopify store data and customers"
              category="E-commerce"
              icon="/integrations/shopify.png"
              status="connected"
            />
            <IntegrationCard
              title="WooCommerce"
              description="Connect your WooCommerce store to Jewelia CRM"
              category="E-commerce"
              icon="/integrations/woocommerce.png"
              status="not-connected"
            />
            <IntegrationCard
              title="Mailchimp"
              description="Sync your email campaigns and subscriber lists"
              category="Email"
              icon="/integrations/mailchimp.png"
              status="connected"
            />
            <IntegrationCard
              title="Google Calendar"
              description="Sync your calendar events and appointments"
              category="Calendar"
              icon="/integrations/google-calendar.png"
              status="connected"
            />
            <IntegrationCard
              title="Outlook Calendar"
              description="Connect your Outlook calendar for appointment scheduling"
              category="Calendar"
              icon="/integrations/outlook.png"
              status="not-connected"
            />
            <IntegrationCard
              title="ShipStation"
              description="Automate your shipping and fulfillment process"
              category="Shipping"
              icon="/integrations/shipstation.png"
              status="not-connected"
            />
            <IntegrationCard
              title="Stripe"
              description="Process payments and manage subscriptions"
              category="Payment"
              icon="/integrations/stripe.png"
              status="connected"
            />
          </div>
        </TabsContent>

        <TabsContent value="accounting" className="space-y-4 sm:space-y-6">
          <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <IntegrationCard
              title="QuickBooks"
              description="Connect your QuickBooks account to sync financial data"
              category="Accounting"
              icon="/integrations/quickbooks.png"
              status="connected"
            />
            <IntegrationCard
              title="Xero"
              description="Sync your Xero accounting data with Jewelia CRM"
              category="Accounting"
              icon="/integrations/xero.png"
              status="not-connected"
            />
            <IntegrationCard
              title="FreshBooks"
              description="Connect FreshBooks to manage invoices and expenses"
              category="Accounting"
              icon="/integrations/freshbooks.png"
              status="not-connected"
            />
          </div>
        </TabsContent>

        {/* Other tab contents would be similar */}
      </Tabs>
    </div>
  )
}
