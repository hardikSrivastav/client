"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PageHeader } from "@/components/common/PageHeader"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Copy, Check, AlertCircle, Loader2, Share2 } from "lucide-react"
import { toast } from "react-hot-toast"

interface Survey {
  _id: string
  title: string
  description: string
  access_key: string
  created_at: string
  is_active: boolean
  metrics: Array<any>
}

export default function SurveyLinkPage() {
  const params = useParams()
  const surveyId = params.id as string
  
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  const surveyLink = survey ? `${window.location.origin}/survey/respond/${survey._id}?key=${survey.access_key}` : ""
  
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survey/mongo/surveys/${surveyId}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch survey")
        }
        
        const data = await response.json()
        setSurvey(data.data)
      } catch (err) {
        console.error("Error fetching survey:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }
    
    fetchSurvey()
  }, [surveyId])
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyLink)
    setCopied(true)
    toast.success("Survey link copied to clipboard")
    
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }
  
  const handleShare = async () => {
    if (!navigator.share) {
      toast.error("Web Share API is not supported in your browser")
      return
    }
    
    try {
      await navigator.share({
        title: survey?.title || "Survey",
        text: "Please take a moment to complete this survey",
        url: surveyLink
      })
      toast.success("Shared successfully")
    } catch (err) {
      console.error("Error sharing:", err)
      toast.error("Failed to share survey")
    }
  }
  
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <PageHeader title="rForms" path="Survey Link" />
        <div className="container flex-1 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading survey information...</p>
          </div>
        </div>
      </main>
    )
  }
  
  if (error || !survey) {
    return (
      <main className="flex min-h-screen flex-col">
        <PageHeader title="rForms" path="Survey Link" />
        <div className="container flex-1 py-8">
          <div className="mx-auto max-w-3xl">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error || "Failed to load survey"}</AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
    )
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <PageHeader title="rForms" path="Survey Link" />
      
      <div className="container flex-1 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Your Survey is Ready!</h2>
            <p className="text-muted-foreground">
              Share this link with your respondents to start collecting data.
            </p>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{survey.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{survey.description}</p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  value={surveyLink}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={handleCopyLink} className="gap-2">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
                
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <Button onClick={handleShare} variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <div className="text-sm text-muted-foreground">
                <p>{survey.metrics.length} metrics • {survey.is_active ? "Active" : "Inactive"}</p>
              </div>
              
              <Button onClick={() => window.open(surveyLink, "_blank")}>
                Preview Survey
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">1. Share your survey</h3>
                <p className="text-sm text-muted-foreground">
                  Send the link to your target audience via email, social media, or messaging apps.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">2. Monitor responses</h3>
                <p className="text-sm text-muted-foreground">
                  Check the dashboard to see responses as they come in.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">3. Analyze results</h3>
                <p className="text-sm text-muted-foreground">
                  Review analytics to understand how your metrics perform.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = "/dashboard"}
              >
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
} 