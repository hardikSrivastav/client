"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, CheckCircle, ArrowRight } from "lucide-react"

interface Survey {
  _id: string
  title: string
  description: string
  metrics: Array<{
    id: string
    name: string
    type: string
    description: string | null
  }>
}

interface Question {
  id: string
  text: string
  type: string
  options?: string[]
  metric_id: string
}

export default function RespondToSurveyPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const surveyId = params.id as string
  const accessKey = searchParams.get('key')
  
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState<string>("")
  const [answerLoading, setAnswerLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [questionNumber, setQuestionNumber] = useState(1)
  
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survey/mongo/surveys/${surveyId}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch survey")
        }
        
        const data = await response.json()
        setSurvey(data.data)
        
        // After getting the survey, request the first question
        await getNextQuestion()
      } catch (err) {
        console.error("Error fetching survey:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }
    
    // Only fetch if we have an access key
    if (accessKey) {
      fetchSurvey()
    } else {
      setError("Invalid survey access key")
      setLoading(false)
    }
  }, [surveyId, accessKey])
  
  const getNextQuestion = async () => {
    setAnswerLoading(true)
    
    try {
      // Mock API call for demo (in real implementation this would hit an adaptive question endpoint)
      // In a real implementation this would be:
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionToken}/next-question`)
      
      // For now we'll just simulate a delay and serve a random question
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // If we've already answered 5 questions or there's no survey, end the survey
      if (questionNumber > 5 || !survey) {
        setCompleted(true)
        setCurrentQuestion(null)
        setAnswerLoading(false)
        return
      }
      
      // Otherwise generate a mock question
      if (survey.metrics.length > 0) {
        const randomMetricIndex = Math.floor(Math.random() * survey.metrics.length)
        const metric = survey.metrics[randomMetricIndex]
        
        const question: Question = {
          id: `q-${Date.now()}`,
          text: `How would you rate the ${metric.name.toLowerCase()}?`,
          type: metric.type,
          metric_id: metric.id,
          options: metric.type === "multiple_choice" ? ["Excellent", "Good", "Average", "Poor", "Very Poor"] : undefined
        }
        
        setCurrentQuestion(question)
        setAnswer("")
      }
    } catch (err) {
      console.error("Error getting next question:", err)
      setError(err instanceof Error ? err.message : "An error occurred while loading the next question")
    } finally {
      setAnswerLoading(false)
    }
  }
  
  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !answer) return
    
    setAnswerLoading(true)
    
    try {
      // Mock API call (in real implementation, this would save the response)
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${sessionToken}/responses`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ question_id: currentQuestion.id, answer })
      // })
      
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Move to the next question
      setQuestionNumber(prev => prev + 1)
      await getNextQuestion()
    } catch (err) {
      console.error("Error submitting answer:", err)
      setError(err instanceof Error ? err.message : "An error occurred while submitting your answer")
    } finally {
      setAnswerLoading(false)
    }
  }
  
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="container flex-1 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading survey...</p>
          </div>
        </div>
      </main>
    )
  }
  
  if (error) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="container flex-1 py-8">
          <div className="mx-auto max-w-3xl">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      </main>
    )
  }
  
  if (completed) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="container flex-1 py-8">
          <div className="mx-auto max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Survey Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Thank you for completing the survey! Your responses have been recorded.</p>
                <p className="text-sm text-muted-foreground">
                  You may now close this window or go back to the main page.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = "/"}
                >
                  Return to Home
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    )
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <div className="container flex-1 py-8">
        <div className="mx-auto max-w-3xl">
          {survey && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">{survey.title}</h1>
              <p className="text-muted-foreground">{survey.description}</p>
            </div>
          )}
          
          {currentQuestion ? (
            <Card>
              <CardHeader>
                <div className="text-sm text-muted-foreground mb-2">Question {questionNumber}</div>
                <CardTitle>{currentQuestion.text}</CardTitle>
              </CardHeader>
              <CardContent>
                {currentQuestion.type === "text" && (
                  <Textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-32"
                  />
                )}
                
                {(currentQuestion.type === "likert" || currentQuestion.type === "rating" || currentQuestion.type === "boolean" || currentQuestion.type === "multiple_choice") && (
                  <RadioGroup value={answer} onValueChange={setAnswer} className="space-y-3">
                    {currentQuestion.type === "likert" && (
                      <>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="r1" />
                          <Label htmlFor="r1">Strongly Disagree</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2" id="r2" />
                          <Label htmlFor="r2">Disagree</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3" id="r3" />
                          <Label htmlFor="r3">Neutral</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="4" id="r4" />
                          <Label htmlFor="r4">Agree</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="5" id="r5" />
                          <Label htmlFor="r5">Strongly Agree</Label>
                        </div>
                      </>
                    )}
                    
                    {currentQuestion.type === "rating" && (
                      Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                        <div key={num} className="flex items-center space-x-2">
                          <RadioGroupItem value={num.toString()} id={`r${num}`} />
                          <Label htmlFor={`r${num}`}>{num}</Label>
                        </div>
                      ))
                    )}
                    
                    {currentQuestion.type === "boolean" && (
                      <>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="yes" />
                          <Label htmlFor="yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="no" />
                          <Label htmlFor="no">No</Label>
                        </div>
                      </>
                    )}
                    
                    {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
                      currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`o${index}`} />
                          <Label htmlFor={`o${index}`}>{option}</Label>
                        </div>
                      ))
                    )}
                  </RadioGroup>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSubmitAnswer} 
                  disabled={!answer || answerLoading}
                  className="w-full"
                >
                  {answerLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      Next Question
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </main>
  )
} 