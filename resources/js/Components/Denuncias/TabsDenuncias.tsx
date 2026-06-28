import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';

interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface TabsDenunciasProps {
  tabs: TabItem[];
  defaultValue?: string;
  children: React.ReactNode | ((value: string) => React.ReactNode);
}

export default function TabsDenuncias({ tabs, defaultValue, children }: TabsDenunciasProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue ?? tabs[0]?.value ?? '');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="sticky top-0 z-10 bg-card pb-px">
        <TabsList className="w-full justify-start h-auto gap-0 bg-transparent p-0 border-b border-border rounded-none">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="pt-4 mt-0">
          {typeof children === 'function' ? children(tab.value) : children}
        </TabsContent>
      ))}
    </Tabs>
  );
}
