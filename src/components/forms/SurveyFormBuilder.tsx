"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { GripVertical, PlusCircle, Trash2, AlertCircle, Save, ChevronLeft } from "lucide-react"
import { CollapsibleSection } from "@/components/common/CollapsibleSection"
import { toast } from "react-hot-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"

// Define metric types
export type MetricType = "likert" | "rating" | "boolean" | "multiple_choice" | "text"

// Define a metric
export interface Metric {
  id: string
  name: string
  type: MetricType
  description: string | null
  weight: number
  options?: string[]
}

// Define survey 
export interface Survey {
  id: string
  title: string
  description: string
  metrics: Metric[]
  isPublished: boolean
  created_at: string
  updated_at: string
}

interface SurveyFormBuilderProps {
  goalId: string
  initialGoal?: {
    id: number
    description: string
    metrics: any[]
  }
  onSave?: (survey: Survey) => Promise<void>
}

export function SurveyFormBuilder({ goalId, initialGoal, onSave }: SurveyFormBuilderProps) {
  const router = useRouter()
  
  // State for the survey
  const [survey, setSurvey] = useState<Survey>(() => {
    // If we have initial data, use it
    if (initialGoal) {
      return {
        id: goalId,
        title: `Survey: ${initialGoal.description.substring(0, 30)}...`,
        description: initialGoal.description,
        metrics: initialGoal.metrics.map((metric, index) => ({
          id: metric.id || `metric-${index}`,
          name: metric.name,
          type: metric.type as MetricType,
          description: metric.description,
          weight: 1.0,
          options: metric.type === "multiple_choice" ? ["Option 1", "Option 2", "Option 3"] : undefined
        })),
        isPublished: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    
    // Otherwise return a default survey
    return {
      id: goalId,
      title: "New Survey",
      description: "",
      metrics: [],
      isPublished: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  })
  
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Generate a unique ID
  const generateId = () => {
    return `metric-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }

  // Save the survey and metrics
  const handleSave = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Call the PUT API endpoint to update metrics
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survey/goals/${goalId}/metrics`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          metrics: survey.metrics.map(m => ({
            name: m.name,
            type: m.type,
            description: m.description,
            weight: m.weight,
            options: m.options
          }))
        }),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Failed to save metrics")
      }
      
      // Call the onSave callback if provided
      if (onSave) {
        await onSave(survey)
      }
      
      toast.success("Survey metrics saved successfully")
    } catch (err) {
      console.error("Error saving metrics:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast.error("Failed to save metrics")
    } finally {
      setLoading(false)
    }
  }
  
  // Add a new metric
  const handleAddMetric = (type: MetricType) => {
    const newMetric: Metric = {
      id: generateId(),
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Metric`,
      type,
      description: "",
      weight: 1.0,
      options: type === "multiple_choice" ? ["Option 1", "Option 2", "Option 3"] : undefined
    }
    
    setSurvey(prev => ({
      ...prev,
      metrics: [...prev.metrics, newMetric]
    }))
    
    setSelectedMetricId(newMetric.id)
  }
  
  // Update a metric
  const handleMetricUpdate = (metricId: string, updates: Partial<Metric>) => {
    setSurvey(prev => ({
      ...prev,
      metrics: prev.metrics.map(m => 
        m.id === metricId ? { ...m, ...updates } : m
      )
    }))
  }
  
  // Delete a metric
  const handleDeleteMetric = (metricId: string) => {
    setSurvey(prev => ({
      ...prev,
      metrics: prev.metrics.filter(m => m.id !== metricId)
    }))
    
    if (selectedMetricId === metricId) {
      setSelectedMetricId(null)
    }
  }
  
  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    const metrics = Array.from(survey.metrics)
    const [reorderedMetric] = metrics.splice(result.source.index, 1)
    metrics.splice(result.destination.index, 0, reorderedMetric)
    
    setSurvey(prev => ({ ...prev, metrics }))
  }
  
  // Add a new option to a multiple choice metric
  const handleAddOption = (metricId: string) => {
    const metric = survey.metrics.find(m => m.id === metricId)
    if (!metric || metric.type !== "multiple_choice") return
    
    const options = [...(metric.options || []), `Option ${(metric.options?.length || 0) + 1}`]
    
    handleMetricUpdate(metricId, { options })
  }
  
  // Update an option in a multiple choice metric
  const handleOptionUpdate = (metricId: string, optionIndex: number, value: string) => {
    const metric = survey.metrics.find(m => m.id === metricId)
    if (!metric || metric.type !== "multiple_choice" || !metric.options) return
    
    const options = [...metric.options]
    options[optionIndex] = value
    
    handleMetricUpdate(metricId, { options })
  }
  
  // Delete an option from a multiple choice metric
  const handleDeleteOption = (metricId: string, optionIndex: number) => {
    const metric = survey.metrics.find(m => m.id === metricId)
    if (!metric || metric.type !== "multiple_choice" || !metric.options) return
    
    const options = metric.options.filter((_, i) => i !== optionIndex)
    
    handleMetricUpdate(metricId, { options })
  }
  
  // Get a human-readable metric type label
  const getMetricTypeLabel = (type: MetricType) => {
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
  
  // Publish the survey
  const handlePublish = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Call the publish API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survey/goals/${goalId}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Failed to publish survey")
      }
      
      const data = await response.json()
      
      // Update the survey state
      setSurvey(prev => ({
        ...prev,
        isPublished: true
      }))
      
      toast.success("Survey published successfully")
      
      // Redirect to the survey link page
      router.push(`/survey/link/${data.survey_id}`)
    } catch (err) {
      console.error("Error publishing survey:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast.error("Failed to publish survey")
    } finally {
      setLoading(false)
    }
  }
  
  // Check if the form can be saved (has required info)
  const canSave = () => {
    if (survey.metrics.length === 0) return false
    
    const hasInvalidMetrics = survey.metrics.some(m => !m.name.trim())
    if (hasInvalidMetrics) return false
    
    return true
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Edit Survey Metrics</h2>
          <div className="flex items-center space-x-2">
            <Badge variant={survey.metrics.length > 0 ? "default" : "outline"}>
              {survey.metrics.length} {survey.metrics.length === 1 ? "metric" : "metrics"}
            </Badge>
          </div>
        </div>
        
        <p className="text-muted-foreground">
          Customize the AI-generated metrics to better fit your survey needs.
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Goal display */}
      <Card>
        <CardHeader>
          <CardTitle>Your Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{survey.description}</p>
        </CardContent>
      </Card>
      
      {/* Main builder interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar: Metric types */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => handleAddMetric("likert")} 
                variant="outline" 
                className="w-full justify-start"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Likert Scale (1-5)
              </Button>
              
              <Button 
                onClick={() => handleAddMetric("rating")} 
                variant="outline" 
                className="w-full justify-start"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Rating Scale (1-10)
              </Button>
              
              <Button 
                onClick={() => handleAddMetric("boolean")} 
                variant="outline" 
                className="w-full justify-start"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Yes/No Question
              </Button>
              
              <Button 
                onClick={() => handleAddMetric("multiple_choice")} 
                variant="outline" 
                className="w-full justify-start"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Multiple Choice
              </Button>
              
              <Button 
                onClick={() => handleAddMetric("text")} 
                variant="outline" 
                className="w-full justify-start"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Free Text Response
              </Button>
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <CollapsibleSection title="Metric Types Explained">
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold">Likert Scale (1-5)</h4>
                  <p className="text-muted-foreground">Measures agreement level from Strongly Disagree (1) to Strongly Agree (5).</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Rating Scale (1-10)</h4>
                  <p className="text-muted-foreground">Measures satisfaction or quality on a scale from 1-10.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Yes/No Question</h4>
                  <p className="text-muted-foreground">Simple binary response for direct questions.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Multiple Choice</h4>
                  <p className="text-muted-foreground">Allows selection from predefined options.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Free Text Response</h4>
                  <p className="text-muted-foreground">Collects qualitative feedback in respondent's own words.</p>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </div>
        
        {/* Main content: Metric list */}
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Survey Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {survey.metrics.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No metrics added yet. Add some metrics from the left panel.</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="metrics">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {survey.metrics.map((metric, index) => (
                          <Draggable key={metric.id} draggableId={metric.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`border rounded-md p-4 ${selectedMetricId === metric.id ? 'border-primary' : 'border-border'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1">
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    
                                    <div className="flex-1">
                                      <Input
                                        value={metric.name}
                                        onChange={(e) => handleMetricUpdate(metric.id, { name: e.target.value })}
                                        className="font-medium"
                                        placeholder="Metric name"
                                      />
                                    </div>
                                    
                                    <Badge variant="secondary">
                                      {getMetricTypeLabel(metric.type)}
                                    </Badge>
                                    
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteMetric(metric.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Show metric details when selected */}
                                {selectedMetricId === metric.id && (
                                  <div className="mt-4 space-y-4">
                                    <Textarea
                                      value={metric.description || ""}
                                      onChange={(e) => handleMetricUpdate(metric.id, { description: e.target.value })}
                                      placeholder="Describe what this metric measures..."
                                      className="resize-none"
                                      rows={2}
                                    />
                                    
                                    <div>
                                      <div className="flex justify-between mb-1">
                                        <div className="text-sm font-medium">Metric Weight</div>
                                        <div className="text-sm text-muted-foreground">{metric.weight.toFixed(1)}</div>
                                      </div>
                                      <Slider
                                        value={[metric.weight * 10]}
                                        min={1}
                                        max={20}
                                        step={1}
                                        onValueChange={(values) => handleMetricUpdate(metric.id, { weight: values[0] / 10 })}
                                      />
                                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                        <div>Low</div>
                                        <div>Medium</div>
                                        <div>High</div>
                                      </div>
                                    </div>
                                    
                                    {/* Multiple choice options */}
                                    {metric.type === "multiple_choice" && (
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                          <div className="text-sm font-medium">Answer Options</div>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddOption(metric.id)}
                                          >
                                            <PlusCircle className="h-3 w-3 mr-1" /> Add Option
                                          </Button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          {metric.options && metric.options.map((option, optionIndex) => (
                                            <div key={optionIndex} className="flex items-center space-x-2">
                                              <Input
                                                value={option}
                                                onChange={(e) => handleOptionUpdate(metric.id, optionIndex, e.target.value)}
                                                placeholder={`Option ${optionIndex + 1}`}
                                              />
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteOption(metric.id, optionIndex)}
                                                disabled={metric.options?.length === 1}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Toggle to expand/collapse */}
                                {selectedMetricId !== metric.id && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="mt-2 w-full justify-center"
                                    onClick={() => setSelectedMetricId(metric.id)}
                                  >
                                    Edit details
                                  </Button>
                                )}
                                
                                {selectedMetricId === metric.id && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="mt-2 w-full justify-center"
                                    onClick={() => setSelectedMetricId(null)}
                                  >
                                    Collapse
                                  </Button>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button
                variant="outline"
                onClick={() => router.push("/survey/create")}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Goal
              </Button>
              
              <div className="space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={loading || !canSave()}
                  variant="outline"
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Metrics
                </Button>
                
                <Button
                  onClick={() => router.push(`/survey/forms/${goalId}/generate`)}
                  disabled={loading || !canSave() || survey.metrics.length === 0}
                  variant="outline"
                  className="gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Generate Survey Form
                </Button>
                
                <Button
                  onClick={handlePublish}
                  disabled={loading || !canSave() || survey.metrics.length === 0}
                  className="gap-2"
                >
                  Publish Survey
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 