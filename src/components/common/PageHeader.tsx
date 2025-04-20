"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  path?: string
  showGithubLink?: boolean
}

export function PageHeader({ 
  title, 
  path,
  showGithubLink = true
}: PageHeaderProps) {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4 sm:px-8">
        <h1 className="text-lg font-semibold sm:text-xl">
          <Link href="/">rForms</Link>
          {path && (
            <span className="text-sm font-normal text-muted-foreground"> / {path}</span>
          )}
        </h1>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          {showGithubLink && (
            <Button variant="outline" asChild>
              <Link href="https://github.com/yourusername/rforms" target="_blank">
                GitHub
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 