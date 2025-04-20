"use client"

import ApiTestCard from "@/components/ApiTestCard";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <PageHeader title="rForms" showGithubLink={true} />

      <div className="container flex-1 space-y-8 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Welcome to rForms</h2>
            <p className="text-xl text-muted-foreground mb-6">
              AI-powered adaptive surveys that give you meaningful insights.
            </p>
            <Button asChild size="lg">
              <Link href="/survey/create">Create a Survey</Link>
            </Button>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-xl font-semibold mb-2">Next Steps</h3>
              <p className="mb-4">Ready to get started? Here's what you can do:</p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-primary"></div>
                  <Button asChild variant="link" className="h-auto p-0">
                    <Link href="/survey/create">Create a survey goal</Link>
                  </Button>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-muted"></div>
                  <span className="text-muted-foreground">Try out our API</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 rounded-full bg-muted"></div>
                  <span className="text-muted-foreground">View results dashboard</span>
                </div>
              </div>
            </div>

            <ApiTestCard />
          </div>
        </div>
      </div>
    </main>
  );
}
