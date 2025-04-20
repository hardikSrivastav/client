"use client"

import { GoalCreationForm } from "@/components/forms/GoalCreationForm"
import { CollapsibleSection } from "@/components/common/CollapsibleSection"
import { PageHeader } from "@/components/common/PageHeader"
import Link from "next/link"

export default function CreateSurveyPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <PageHeader title="rForms" path="Create Survey" />

      <div className="container flex-1 space-y-8 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Create a New Survey</h2>
            <p className="text-muted-foreground">
              Define your high-level goal, and our AI will generate appropriate metrics.
            </p>
          </div>

          <GoalCreationForm />

          <div className="mt-8 space-y-6">
            <CollapsibleSection title="How it works" defaultOpen={true}>
              <div className="space-y-4">
                <p>Creating a survey with rForms is a simple 3-step process:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li><strong>Define your goal</strong> - Describe what you want to measure</li>
                  <li><strong>Review metrics</strong> - Our AI generates metrics based on your goal</li>
                  <li><strong>Share your survey</strong> - Get a link to share with respondents</li>
                </ol>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Tips for effective goals">
              <div className="space-y-4">
                <p>For best results with AI-generated metrics, your goal should:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Be specific about what you want to measure</li>
                  <li>Include context about your business or audience</li>
                  <li>Focus on one core theme or objective</li>
                </ul>
                <div className="rounded-md bg-muted p-3 mt-4">
                  <h4 className="font-medium mb-1">Example:</h4>
                  <p className="text-sm italic">
                    "Measure customer satisfaction with our new breakfast menu items to understand taste preferences, portion satisfaction, and value perception"
                  </p>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </main>
  )
} 