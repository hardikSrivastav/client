"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/common/PageHeader"
import { SurveyFormGenerator, Survey, Metric, MetricType } from "@/components/forms/SurveyFormGenerator"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define interfaces for our API data
interface ApiMetric {
  id: number
  name: string
  type: string
  description: string | null
  weight: number
  options?: string[]
}

interface ApiSurvey {
  id: string
  title: string
  description: string
  metrics: ApiMetric[]
  questions?: any[]
}

export default function GenerateFormPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string
  
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
<<<<<<< HEAD
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survey/mongo/surveys/${surveyId}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          console.error("Error response:", {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          })
          throw new Error(`Failed to fetch survey: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log("Received survey data:", data)
        
        const apiSurvey: ApiSurvey = data.data

        console.log("API survey:", apiSurvey)
        
=======
        // First fetch the survey data
        const surveyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survey/mongo/surveys/${surveyId}`)
        
        if (!surveyResponse.ok) {
          const errorData = await surveyResponse.json().catch(() => null)
          console.error("Error response:", {
            status: surveyResponse.status,
            statusText: surveyResponse.statusText,
            data: errorData
          })
          throw new Error(`Failed to fetch survey: ${surveyResponse.status} ${surveyResponse.statusText}`)
        }
        
        const surveyData = await surveyResponse.json()
        console.log("Received survey data:", surveyData)
        
        const apiSurvey: ApiSurvey = surveyData.data
        console.log("API survey:", apiSurvey)
        
        // Try to fetch existing form data if it exists
        let existingForm = null
        try {
          const formResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survey/mongo/forms/${surveyId}`)
          if (formResponse.ok) {
            const formData = await formResponse.json()
            existingForm = formData.data
            console.log("Found existing form:", existingForm)
          }
        } catch (err) {
          console.log("No existing form found or error fetching form:", err)
        }
        
>>>>>>> 9774442 (Initial commit from Create Next App)
        // Convert API survey to component survey format
        const convertedSurvey: Survey = {
          id: apiSurvey.id,
          title: apiSurvey.title,
          description: apiSurvey.description,
          metrics: apiSurvey.metrics?.map(m => ({
            id: m.id,
            name: m.name,
<<<<<<< HEAD
            type: m.type as MetricType, // Cast string to MetricType
=======
            type: m.type as MetricType,
>>>>>>> 9774442 (Initial commit from Create Next App)
            description: m.description || "",
            weight: m.weight,
            options: m.options
          })),
          // If we found an existing form, include its questions
<<<<<<< HEAD
          questions: apiSurvey.questions || []
=======
          questions: existingForm?.questions || []
>>>>>>> 9774442 (Initial commit from Create Next App)
        }
        
        setSurvey(convertedSurvey)
      } catch (err) {
        console.error("Error fetching survey:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }
    
    fetchSurvey()
  }, [surveyId])
  
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <PageHeader title="rForms" path="Generate Survey Form" />
        <div className="container flex-1 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading survey data...</p>
          </div>
        </div>
      </main>
    )
  }
  
  if (error || !survey) {
    return (
      <main className="flex min-h-screen flex-col">
        <PageHeader title="rForms" path="Generate Survey Form" />
        <div className="container flex-1 py-8">
          <div className="mx-auto max-w-5xl">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error || "Failed to load survey data"}</AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
    )
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <PageHeader title="rForms" path="Generate Survey Form" />
      
      <div className="container flex-1 py-8">
        <div className="mx-auto max-w-6xl">
          <SurveyFormGenerator
            surveyId={surveyId} 
            initialSurvey={survey}
          />
        </div>
      </div>
    </main>
  )
} 