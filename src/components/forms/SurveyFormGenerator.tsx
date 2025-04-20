"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { 
  GripVertical, 
  PlusCircle, 
  Trash2, 
  AlertCircle, 
  Save, 
  ChevronLeft,
  FileText,
  Calendar,
  CheckSquare,
  Type,
  Hash,
  Phone,
  Mail,
  Image,
  Upload,
  Loader
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "react-hot-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Define question types
export type QuestionType = 
  | "text" 
  | "textarea" 
  | "email" 
  | "phone" 
  | "number" 
  | "date" 
  | "time" 
  | "select" 
  | "multiselect" 
  | "checkbox" 
  | "radio" 
  | "file" 
  | "image"

// Define a question
export interface Question {
  id: string
  metricId: number
  title: string
  description?: string
  type: QuestionType
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    fileTypes?: string[]
    maxSize?: number
  }
}

// Define metric types
export type MetricType = "likert" | "rating" | "boolean" | "multiple_choice" | "text"

// Define a metric
export interface Metric {
  id: number
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
  questions?: Question[]
  isPublished?: boolean
  created_at?: string
  updated_at?: string
}

// Define form structure
export interface SurveyForm {
  id?: string
  surveyId: string
  title: string
  description: string
  questions: Question[]
  created_at?: string
  updated_at?: string
}

interface SurveyFormGeneratorProps {
  surveyId: string
  initialSurvey?: Survey
}

export function SurveyFormGenerator({ surveyId, initialSurvey }: SurveyFormGeneratorProps) {
  const router = useRouter()
  
  // State for the form
  const [form, setForm] = useState<SurveyForm>(() => {
    // If we have initial data, use it
    if (initialSurvey) {
      return {
        surveyId: initialSurvey.id,
        title: initialSurvey.title || "Survey Form",
        description: initialSurvey.description || "",
<<<<<<< HEAD
        questions: initialSurvey.questions || []
=======
        questions: []
>>>>>>> 9774442 (Initial commit from Create Next App)
      }
    }
    
    // Otherwise return a default form
    return {
      surveyId,
      title: "New Survey Form",
      description: "",
      questions: []
    }
  })
  
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // Auto-save function
  const autoSave = useCallback(async () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }
    
    const timeout = setTimeout(async () => {
      try {
        setLoading(true)
        
        // Call the API to save the form
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survey/mongo/forms`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        })
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.detail || "Failed to save form")
        }
        
        const data = await response.json()
        toast.success("Form saved automatically")
        
        // Update form ID if this is a new form
        if (!form.id && data.id) {
          setForm(prev => ({ ...prev, id: data.id }))
        }
      } catch (err) {
        console.error("Error auto-saving form:", err)
        toast.error("Failed to auto-save form")
      } finally {
        setLoading(false)
      }
    }, 2000) // Save after 2 seconds of inactivity
    
    setAutoSaveTimeout(timeout)
  }, [form, autoSaveTimeout])
  
  // Update form state with auto-save
  const updateForm = useCallback((updates: Partial<SurveyForm>) => {
    setForm(prev => {
      const newForm = { ...prev, ...updates }
      autoSave()
      return newForm
    })
  }, [autoSave])
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
    }
  }, [autoSaveTimeout])
  
  // Generate a unique ID
  const generateId = useCallback(() => {
    return `question-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }, [])
  
  // Get appropriate question type for a metric
  const getQuestionTypeForMetric = useCallback((metric: Metric): QuestionType => {
    switch (metric.type) {
      case "likert":
        return "radio"
      case "rating":
        return "radio"
      case "boolean":
        return "radio"
      case "multiple_choice":
        return "select"
      case "text":
        return "textarea"
      default:
        return "text"
    }
  }, [])
  
  // Question handlers
  const handleQuestionUpdate = useCallback((questionId: string, updates: Partial<Question>) => {
    updateForm({
      questions: form.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    })
  }, [form.questions, updateForm])
  
  const handleDeleteQuestion = useCallback((questionId: string) => {
    updateForm({
      questions: form.questions.filter(q => q.id !== questionId)
    })
    
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null)
    }
  }, [form.questions, selectedQuestionId, updateForm])
  
  const handleAddQuestion = useCallback((type: QuestionType) => {
    const newQuestion: Question = {
      id: generateId(),
      metricId: 0,
      title: `New ${type} question`,
      type,
      required: false
    }
    
    if (type === "select" || type === "multiselect" || type === "radio") {
      newQuestion.options = ["Option 1", "Option 2", "Option 3"]
    }
    
    if (type === "file") {
      newQuestion.validation = {
        fileTypes: [".pdf", ".doc", ".docx"],
        maxSize: 5 * 1024 * 1024
      }
    }
    
    updateForm({
      questions: [...form.questions, newQuestion]
    })
    
    setSelectedQuestionId(newQuestion.id)
  }, [form.questions, updateForm, generateId])
  
  const handleOptionUpdate = useCallback((questionId: string, optionIndex: number, value: string) => {
    const question = form.questions.find(q => q.id === questionId)
    if (!question || !question.options) return
    
    const options = [...question.options]
    options[optionIndex] = value
    
    handleQuestionUpdate(questionId, { options })
  }, [form.questions, handleQuestionUpdate])
  
  const handleAddOption = useCallback((questionId: string) => {
    const question = form.questions.find(q => q.id === questionId)
    if (!question) return
    
    const options = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`]
    
    handleQuestionUpdate(questionId, { options })
  }, [form.questions, handleQuestionUpdate])
  
  const handleDeleteOption = useCallback((questionId: string, optionIndex: number) => {
    const question = form.questions.find(q => q.id === questionId)
    if (!question || !question.options) return
    
    const options = question.options.filter((_, i) => i !== optionIndex)
    
    handleQuestionUpdate(questionId, { options })
  }, [form.questions, handleQuestionUpdate])
  
  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return
    
    const questions = Array.from(form.questions)
    const [reorderedQuestion] = questions.splice(result.source.index, 1)
    questions.splice(result.destination.index, 0, reorderedQuestion)
    
    updateForm({ questions })
  }, [form.questions, updateForm])
  
  // Generate questions from metrics
  const generateQuestionsFromMetrics = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      if (!initialSurvey || !initialSurvey.metrics || initialSurvey.metrics.length === 0) {
        throw new Error("No metrics available to generate questions")
      }
      
      // Call the API to generate questions using AI
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survey/mongo/forms/${form.surveyId}/generate-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Failed to generate questions")
      }
      
      const data = await response.json()
      
      // Update the form with generated questions
      setForm(prev => ({
        ...prev,
        questions: data.data.questions.map((q: any) => ({
          id: q.id,
          metricId: q.metric_id,
          title: q.question,
          type: q.type as QuestionType,
          required: q.required,
          options: q.options,
          description: q.description
        }))
      }))
      
      toast.success("Questions generated successfully!")
    } catch (err) {
      console.error("Error generating questions:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast.error("Failed to generate questions")
    } finally {
      setIsGenerating(false)
    }
  }
  
  // Save the form
  const handleSave = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Call the API to save the form
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/survey/forms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Failed to save form")
      }
      
      const data = await response.json()
      toast.success("Form saved successfully")
      
      // Redirect to the form view page
      router.push(`/survey/forms/${data.id}`)
    } catch (err) {
      console.error("Error saving form:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast.error("Failed to save form")
    } finally {
      setLoading(false)
    }
  }
  
  // Get question type icon
  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case "text":
        return <Type className="h-4 w-4" />
      case "textarea":
        return <FileText className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "phone":
        return <Phone className="h-4 w-4" />
      case "number":
        return <Hash className="h-4 w-4" />
      case "date":
      case "time":
        return <Calendar className="h-4 w-4" />
      case "select":
      case "multiselect":
        return <CheckSquare className="h-4 w-4" />
      case "checkbox":
      case "radio":
        return <CheckSquare className="h-4 w-4" />
      case "file":
        return <Upload className="h-4 w-4" />
      case "image":
        return <Image className="h-4 w-4" />
      default:
        return <Type className="h-4 w-4" />
    }
  }
  
  // Check if the form is valid for saving
  const canSaveForm = () => {
    if (!form.title.trim()) return false
    if (form.questions.length === 0) return false
    
    const hasInvalidQuestions = form.questions.some(q => !q.title.trim())
    if (hasInvalidQuestions) return false
    
    return true
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Generate Survey Form</h2>
          <div className="flex items-center space-x-2">
            <Badge variant={form.questions.length > 0 ? "default" : "outline"}>
              {form.questions.length} {form.questions.length === 1 ? "question" : "questions"}
            </Badge>
          </div>
        </div>
        
        <p className="text-muted-foreground">
          Create a form based on your metrics or add custom questions.
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
      
      {/* Form details */}
      <Card>
        <CardHeader>
          <CardTitle>Form Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="form-title">Form Title</Label>
            <Input
              id="form-title"
              value={form.title}
              onChange={(e) => updateForm({ title: e.target.value })}
              placeholder="Enter form title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="form-description">Form Description</Label>
            <Textarea
              id="form-description"
              value={form.description}
              onChange={(e) => updateForm({ description: e.target.value })}
              placeholder="Enter form description"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={generateQuestionsFromMetrics}
            disabled={isGenerating || !initialSurvey?.metrics?.length}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                Generate Questions from Metrics
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Question Types */}
      <Card>
        <CardHeader>
          <CardTitle>Add Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <Button variant="outline" onClick={() => handleAddQuestion("text")} className="justify-start">
              <Type className="h-4 w-4 mr-2" /> Text
            </Button>
            
            <Button variant="outline" onClick={() => handleAddQuestion("textarea")} className="justify-start">
              <FileText className="h-4 w-4 mr-2" /> Textarea
            </Button>
            
            <Button variant="outline" onClick={() => handleAddQuestion("email")} className="justify-start">
              <Mail className="h-4 w-4 mr-2" /> Email
            </Button>
            
            <Button variant="outline" onClick={() => handleAddQuestion("phone")} className="justify-start">
              <Phone className="h-4 w-4 mr-2" /> Phone
            </Button>
            
            <Button variant="outline" onClick={() => handleAddQuestion("number")} className="justify-start">
              <Hash className="h-4 w-4 mr-2" /> Number
            </Button>
            
            <Button variant="outline" onClick={() => handleAddQuestion("date")} className="justify-start">
              <Calendar className="h-4 w-4 mr-2" /> Date
            </Button>
            
            <Button variant="outline" onClick={() => handleAddQuestion("select")} className="justify-start">
              <CheckSquare className="h-4 w-4 mr-2" /> Select
            </Button>
            
            <Button variant="outline" onClick={() => handleAddQuestion("multiselect")} className="justify-start">
              <CheckSquare className="h-4 w-4 mr-2" /> Multiselect
            </Button>
            
            <Button variant="outline" onClick={() => handleAddQuestion("radio")} className="justify-start">
              <CheckSquare className="h-4 w-4 mr-2" /> Radio
            </Button>
            
            <Button variant="outline" onClick={() => handleAddQuestion("checkbox")} className="justify-start">
              <CheckSquare className="h-4 w-4 mr-2" /> Checkbox
            </Button>
            
            <Button variant="outline" onClick={() => handleAddQuestion("file")} className="justify-start">
              <Upload className="h-4 w-4 mr-2" /> File Upload
            </Button>
            
            <Button variant="outline" onClick={() => handleAddQuestion("image")} className="justify-start">
              <Image className="h-4 w-4 mr-2" /> Image Upload
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Form Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {form.questions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No questions yet. Generate from metrics or add custom questions.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {form.questions.map((question, index) => (
                      <Draggable key={question.id} draggableId={question.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border rounded-md p-4 ${
                              selectedQuestionId === question.id ? 'border-primary' : 'border-border'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                                
                                <div className="flex-1">
                                  <Input
                                    value={question.title}
                                    onChange={(e) => handleQuestionUpdate(question.id, { title: e.target.value })}
                                    className="font-medium"
                                    placeholder="Question title"
                                  />
                                </div>
                                
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  {getQuestionTypeIcon(question.type)}
                                  <span className="capitalize">{question.type}</span>
                                </Badge>
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteQuestion(question.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                            
                            {selectedQuestionId === question.id && (
                              <div className="mt-4 space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`question-${question.id}-description`}>Description (Optional)</Label>
                                  <Textarea
                                    id={`question-${question.id}-description`}
                                    value={question.description || ""}
                                    onChange={(e) => handleQuestionUpdate(question.id, { description: e.target.value })}
                                    placeholder="Add a description or instructions for this question"
                                    className="resize-none"
                                    rows={2}
                                  />
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={`question-${question.id}-required`}
                                    checked={question.required}
                                    onCheckedChange={(checked: boolean) => handleQuestionUpdate(question.id, { required: checked })}
                                  />
                                  <Label htmlFor={`question-${question.id}-required`}>Required</Label>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor={`question-${question.id}-type`}>Question Type</Label>
                                  <Select
                                    value={question.type}
                                    onValueChange={(value: QuestionType) => handleQuestionUpdate(question.id, { type: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a question type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Text</SelectItem>
                                      <SelectItem value="textarea">Textarea</SelectItem>
                                      <SelectItem value="email">Email</SelectItem>
                                      <SelectItem value="phone">Phone</SelectItem>
                                      <SelectItem value="number">Number</SelectItem>
                                      <SelectItem value="date">Date</SelectItem>
                                      <SelectItem value="select">Select</SelectItem>
                                      <SelectItem value="multiselect">Multiselect</SelectItem>
                                      <SelectItem value="radio">Radio</SelectItem>
                                      <SelectItem value="checkbox">Checkbox</SelectItem>
                                      <SelectItem value="file">File Upload</SelectItem>
                                      <SelectItem value="image">Image Upload</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {/* Show options for select, multiselect, radio, checkbox */}
                                {(question.type === "select" || question.type === "multiselect" || 
                                  question.type === "radio" || question.type === "checkbox") && (
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <Label>Options</Label>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddOption(question.id)}
                                      >
                                        <PlusCircle className="h-3 w-3 mr-1" /> Add Option
                                      </Button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {question.options && question.options.map((option, optionIndex) => (
                                        <div key={optionIndex} className="flex items-center space-x-2">
                                          <Input
                                            value={option}
                                            onChange={(e) => handleOptionUpdate(question.id, optionIndex, e.target.value)}
                                            placeholder={`Option ${optionIndex + 1}`}
                                          />
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteOption(question.id, optionIndex)}
                                            disabled={question.options?.length === 1}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Show file type validation for file uploads */}
                                {(question.type === "file" || question.type === "image") && (
                                  <div className="space-y-2">
                                    <Label>Allowed File Types</Label>
                                    <Input
                                      value={question.validation?.fileTypes?.join(", ") || ""}
                                      onChange={(e) => handleQuestionUpdate(question.id, { 
                                        validation: {
                                          ...question.validation,
                                          fileTypes: e.target.value.split(",").map(type => type.trim())
                                        }
                                      })}
                                      placeholder=".pdf, .jpg, .png"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      Enter comma-separated file extensions (e.g., .pdf, .jpg)
                                    </p>
                                    
                                    <div className="pt-2">
                                      <Label>Max File Size (MB)</Label>
                                      <Input
                                        type="number"
                                        value={(question.validation?.maxSize || 0) / (1024 * 1024)}
                                        onChange={(e) => handleQuestionUpdate(question.id, { 
                                          validation: {
                                            ...question.validation,
                                            maxSize: Number(e.target.value) * 1024 * 1024
                                          }
                                        })}
                                        placeholder="5"
                                        min="1"
                                        max="50"
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                {/* Show number validation for number type */}
                                {question.type === "number" && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Min Value</Label>
                                      <Input
                                        type="number"
                                        value={question.validation?.min || ""}
                                        onChange={(e) => handleQuestionUpdate(question.id, { 
                                          validation: {
                                            ...question.validation,
                                            min: e.target.value === "" ? undefined : Number(e.target.value)
                                          }
                                        })}
                                        placeholder="Min value"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Max Value</Label>
                                      <Input
                                        type="number"
                                        value={question.validation?.max || ""}
                                        onChange={(e) => handleQuestionUpdate(question.id, { 
                                          validation: {
                                            ...question.validation,
                                            max: e.target.value === "" ? undefined : Number(e.target.value)
                                          }
                                        })}
                                        placeholder="Max value"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Toggle to expand/collapse */}
                            {selectedQuestionId !== question.id && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 w-full justify-center"
                                onClick={() => setSelectedQuestionId(question.id)}
                              >
                                Edit details
                              </Button>
                            )}
                            
                            {selectedQuestionId === question.id && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 w-full justify-center"
                                onClick={() => setSelectedQuestionId(null)}
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
            onClick={() => router.push(`/survey/metrics/${surveyId}/edit`)}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Metrics
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 