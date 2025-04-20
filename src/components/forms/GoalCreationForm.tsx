"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export function GoalCreationForm() {
  const [goalDescription, setGoalDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalDescription.trim()) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survey/goals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: goalDescription }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || "Failed to create survey goal")
      }
      
      // Redirect to the metrics review page
      router.push(`/survey/metrics/${data.data.id}`)
    } catch (error) {
      console.error("Error submitting goal:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create a New Survey Goal</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="goal-description" className="text-sm font-medium">
                Goal Description
              </label>
              <Textarea
                id="goal-description"
                placeholder="Enter your survey goal (e.g., 'Measure customer satisfaction with our new breakfast menu')"
                className="min-h-32"
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Describe what you want to measure. Our AI will generate appropriate metrics based on your goal.
              </p>
            </div>
            
            {error && (
              <div className="p-3 text-sm rounded bg-destructive/15 text-destructive">
                {error}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting || !goalDescription.trim()}>
            {isSubmitting ? "Creating..." : "Create Goal"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 