"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PageHeader } from "@/components/common/PageHeader"
import { SurveyFormBuilder } from "@/components/forms/SurveyFormBuilder"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define interfaces for our data
interface Metric {
  id: number
  name: string
  type: string
  description: string | null
}

interface Goal {
  id: number
  description: string
  metrics: Metric[]
}

export default function EditMetricsPage() {
  const params = useParams()
  const goalId = params.id as string
  
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survey/goals/${goalId}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch survey goal")
        }
        
        const data = await response.json()
        setGoal(data.data)
      } catch (err) {
        console.error("Error fetching goal:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }
    
    fetchGoal()
  }, [goalId])
  
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <PageHeader title="rForms" path="Edit Metrics" />
        <div className="container flex-1 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading survey metrics...</p>
          </div>
        </div>
      </main>
    )
  }
  
  if (error || !goal) {
    return (
      <main className="flex min-h-screen flex-col">
        <PageHeader title="rForms" path="Edit Metrics" />
        <div className="container flex-1 py-8">
          <div className="mx-auto max-w-5xl">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error || "Failed to load survey goal and metrics"}</AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
    )
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <PageHeader title="rForms" path="Edit Metrics" />
      
      <div className="container flex-1 py-8">
        <div className="mx-auto max-w-6xl">
          <SurveyFormBuilder 
            goalId={goalId} 
            initialGoal={goal}
          />
        </div>
      </div>
    </main>
  )
} 