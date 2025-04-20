"use client"

import React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className = "",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={`w-full ${className}`}
    >
      <div className="flex items-center justify-between rounded-t-md border bg-card px-4 py-3">
        <h3 className="text-lg font-medium">{title}</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            {isOpen ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
            <span className="sr-only">Toggle {title}</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="rounded-b-md border border-t-0 bg-card p-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
} 