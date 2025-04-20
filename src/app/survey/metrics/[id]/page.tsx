"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

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
  unique_id: string
  metrics: Metric[]
}

export default function MetricsReviewPage() {
  const params = useParams()
  const router = useRouter()
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
  
  const getMetricTypeIcon = (type: string) => {
    switch (type) {
      case "likert":
        return "5-point scale"
      case "rating": 
        return "1-10 rating"
      case "boolean":
        return "Yes/No"
      case "multiple_choice":
        return "Multiple choice"
      case "text":
        return "Free text"
      default:
        return type
    }
  }
  
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <PageHeader title="rForms" path="Metrics Review" />
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
        <PageHeader title="rForms" path="Metrics Review" />
        <div className="container flex-1 py-8">
          <div className="mx-auto max-w-3xl">
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Error Loading Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{error || "Failed to load survey goal and metrics"}</p>
                <Button 
                  onClick={() => router.push("/survey/create")} 
                  className="mt-4"
                >
                  Go Back to Create Survey
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <PageHeader title="rForms" path="Metrics Review" />
      
      <div className="container flex-1 space-y-8 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Review Generated Metrics</h2>
            <p className="text-muted-foreground">
              Our AI has analyzed your goal and generated the following metrics.
            </p>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Goal</CardTitle>
              <CardDescription>This is the goal you provided for your survey</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{goal.description}</p>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Generated Metrics</h3>
              <Badge variant="outline" className="px-2 py-1">
                {goal.metrics.length} metrics
              </Badge>
            </div>
            
            <Separator />
            
            {goal.metrics.map((metric) => (
              <Card key={metric.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                  <Badge variant="secondary">{getMetricTypeIcon(metric.type)}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
            
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => router.push("/survey/create")}>
                Back to Edit Goal
              </Button>
              <Button 
                onClick={() => router.push(`/survey/metrics/${goalId}/edit`)}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Create Survey with These Metrics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 