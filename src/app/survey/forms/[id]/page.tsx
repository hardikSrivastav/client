"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/common/PageHeader"
import { SurveyFormPreview } from "@/components/forms/SurveyFormPreview"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Question } from "@/components/forms/SurveyFormGenerator"
import { toast } from "react-hot-toast"

interface SurveyForm {
  id: string
  surveyId: string
  title: string
  description: string
  questions: Question[]
}

export default function ViewFormPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string
  
  const [form, setForm] = useState<SurveyForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survey/forms/${formId}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch form")
        }
        
        const data = await response.json()
        setForm(data.data)
      } catch (err) {
        console.error("Error fetching form:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }
    
    fetchForm()
  }, [formId])
  
  const handleSubmit = async (responses: Record<string, any>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survey/forms/${formId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ responses }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Failed to submit form")
      }
      
      toast.success("Form submitted successfully!")
      
      // Redirect to thank you page
      router.push(`/survey/forms/${formId}/thank-you`)
    } catch (err) {
      console.error("Error submitting form:", err)
      throw err
    }
  }
  
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <PageHeader title="rForms" path="Survey Form" />
        <div className="container flex-1 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading form...</p>
          </div>
        </div>
      </main>
    )
  }
  
  if (error || !form) {
    return (
      <main className="flex min-h-screen flex-col">
        <PageHeader title="rForms" path="Survey Form" />
        <div className="container flex-1 py-8">
          <div className="mx-auto max-w-5xl">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error || "Failed to load form"}</AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
    )
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <PageHeader title="rForms" path="Survey Form" />
      
      <div className="container flex-1 py-8">
        <div className="mx-auto max-w-4xl">
          <SurveyFormPreview 
            title={form.title} 
            description={form.description}
            questions={form.questions}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </main>
  )
} 