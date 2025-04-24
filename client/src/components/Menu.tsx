import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

interface MenuItem {
  label?: string;
  icon?: string;
  onClick?: () => void;
  checked?: boolean;
  type?: 'separator';
}

interface MenuProps {
  title: string;
  items: MenuItem[];
}

const Menu = ({ title, items }: MenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="app-menu-button font-medium">
          {title}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuGroup>
          {items.map((item, index) => {
            if (item.type === 'separator') {
              return <DropdownMenuSeparator key={`sep-${index}`} />
            }
            
            return (
              <DropdownMenuItem
                key={item.label || `item-${index}`}
                onClick={item.onClick}
                className="flex items-center"
              >
                {item.icon && <i className={`${item.icon} mr-2 text-base`}></i>}
                <span>{item.label}</span>
                {item.checked && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Menu;
