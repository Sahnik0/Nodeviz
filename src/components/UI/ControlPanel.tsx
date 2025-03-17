
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ControlPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ControlPanel = ({ title, children, className }: ControlPanelProps) => {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-md">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
};

export default ControlPanel;
