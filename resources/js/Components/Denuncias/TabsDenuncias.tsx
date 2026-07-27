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
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode | ((value: string) => React.ReactNode);
}

export default function TabsDenuncias({ tabs, defaultValue, value, onValueChange, children }: TabsDenunciasProps) {
  const [internalActiveTab, setInternalActiveTab] = React.useState(defaultValue ?? tabs[0]?.value ?? '');
  const activeTab = value !== undefined ? value : internalActiveTab;

  const handleTabChange = (v: string) => {
    if (onValueChange) onValueChange(v);
    setInternalActiveTab(v);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="sticky -top-4 sm:-top-6 md:-top-8 z-20 bg-background border-b border-border shadow-xs -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-2.5 mb-4">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          <TabsList className="w-full min-w-max justify-start h-auto gap-0 bg-transparent p-0 border-none rounded-none">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="relative shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
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
      </div>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="pt-4 mt-0">
          {typeof children === 'function' ? children(tab.value) : children}
        </TabsContent>
      ))}
    </Tabs>
  );
}
