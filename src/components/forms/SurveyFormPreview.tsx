"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Question } from "./SurveyFormGenerator"
import { toast } from "react-hot-toast"

interface SurveyFormPreviewProps {
  title: string
  description: string
  questions: Question[]
  onSubmit: (responses: Record<string, any>) => Promise<void>
  isPreviewMode?: boolean
}

export function SurveyFormPreview({ 
  title,
  description,
  questions,
  onSubmit,
  isPreviewMode = false 
}: SurveyFormPreviewProps) {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  
  const handleInputChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const requiredQuestions = questions.filter(q => q.required)
    const missingResponses = requiredQuestions.filter(q => {
      const response = responses[q.id]
      return response === undefined || response === "" || 
             (Array.isArray(response) && response.length === 0)
    })
    
    if (missingResponses.length > 0) {
      toast.error(`Please answer all required questions (${missingResponses.length} missing)`)
      return
    }
    
    if (isPreviewMode) {
      toast.success("Form validated successfully! This is just a preview.")
      console.log("Preview form responses:", responses)
      return
    }
    
    setLoading(true)
    
    try {
      await onSubmit(responses)
      toast.success("Form submitted successfully!")
      
      // Reset form
      setResponses({})
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("Failed to submit form. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  
  // Render different question types
  const renderQuestion = (question: Question) => {
    const { id, title, description, type, required, options, validation } = question
    
    switch (type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {title}
            </Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <Input
              id={id}
              value={responses[id] || ""}
              onChange={(e) => handleInputChange(id, e.target.value)}
              disabled={isPreviewMode}
            />
          </div>
        )
        
      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {title}
            </Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <Textarea
              id={id}
              value={responses[id] || ""}
              onChange={(e) => handleInputChange(id, e.target.value)}
              disabled={isPreviewMode}
              rows={4}
            />
          </div>
        )
        
      case "email":
        return (
          <div className="space-y-2">
            <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {title}
            </Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <Input
              id={id}
              type="email"
              value={responses[id] || ""}
              onChange={(e) => handleInputChange(id, e.target.value)}
              disabled={isPreviewMode}
            />
          </div>
        )
        
      case "phone":
        return (
          <div className="space-y-2">
            <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {title}
            </Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <Input
              id={id}
              type="tel"
              value={responses[id] || ""}
              onChange={(e) => handleInputChange(id, e.target.value)}
              disabled={isPreviewMode}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        )
        
      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {title}
            </Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <Input
              id={id}
              type="number"
              value={responses[id] || ""}
              onChange={(e) => handleInputChange(id, e.target.value === "" ? "" : Number(e.target.value))}
              disabled={isPreviewMode}
              min={validation?.min}
              max={validation?.max}
            />
          </div>
        )
        
      case "date":
        return (
          <div className="space-y-2">
            <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {title}
            </Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !responses[id] && "text-muted-foreground"
                  )}
                  disabled={isPreviewMode}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {responses[id] ? format(new Date(responses[id]), "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={responses[id] ? new Date(responses[id]) : undefined}
                  onSelect={(date: Date | undefined) => handleInputChange(id, date?.toISOString())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )
        
      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {title}
            </Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <Select
              value={responses[id] || ""}
              onValueChange={(value) => handleInputChange(id, value)}
              disabled={isPreviewMode}
            >
              <SelectTrigger id={id}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
        
      case "multiselect":
        // Initialize as an array if not already
        if (!responses[id]) {
          setResponses(prev => ({ ...prev, [id]: [] }))
        }
        
        return (
          <div className="space-y-2">
            <Label className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {title}
            </Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <div className="space-y-2">
              {options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${id}-${index}`}
                    checked={(responses[id] || []).includes(option)}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        handleInputChange(id, [...(responses[id] || []), option])
                      } else {
                        handleInputChange(
                          id,
                          (responses[id] || []).filter((item: string) => item !== option)
                        )
                      }
                    }}
                    disabled={isPreviewMode}
                  />
                  <Label htmlFor={`${id}-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        )
        
      case "radio":
        return (
          <div className="space-y-2">
            <Label className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {title}
            </Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <RadioGroup
              value={responses[id] || ""}
              onValueChange={(value) => handleInputChange(id, value)}
              disabled={isPreviewMode}
            >
              {options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${id}-${index}`} />
                  <Label htmlFor={`${id}-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )
        
      case "checkbox":
        // For a single checkbox (boolean value)
        if (!options || options.length === 0) {
          return (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={id}
                  checked={responses[id] || false}
                  onCheckedChange={(checked: boolean) => handleInputChange(id, !!checked)}
                  disabled={isPreviewMode}
                />
                <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                  {title}
                </Label>
              </div>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          )
        }
        
        // For multiple checkboxes (same as multiselect)
        return (
          <div className="space-y-2">
            <Label className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {title}
            </Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <div className="space-y-2">
              {options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${id}-${index}`}
                    checked={(responses[id] || []).includes(option)}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        handleInputChange(id, [...(responses[id] || []), option])
                      } else {
                        handleInputChange(
                          id,
                          (responses[id] || []).filter((item: string) => item !== option)
                        )
                      }
                    }}
                    disabled={isPreviewMode}
                  />
                  <Label htmlFor={`${id}-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        )
        
      case "file":
      case "image":
        return (
          <div className="space-y-2">
            <Label htmlFor={id} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {title}
            </Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <Input
              id={id}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // In a real app, you might want to handle file uploads differently
                  handleInputChange(id, file)
                }
              }}
              disabled={isPreviewMode}
              accept={validation?.fileTypes?.join(",")}
            />
            {validation?.fileTypes && (
              <p className="text-xs text-muted-foreground">
                Allowed file types: {validation.fileTypes.join(", ")}
              </p>
            )}
            {validation?.maxSize && (
              <p className="text-xs text-muted-foreground">
                Max file size: {(validation.maxSize / (1024 * 1024)).toFixed(1)} MB
              </p>
            )}
          </div>
        )
        
      default:
        return (
          <div className="space-y-2">
            <Label>{title}</Label>
            <p className="text-sm text-red-500">Question type not supported</p>
          </div>
        )
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="border rounded-lg p-4">
              {renderQuestion(question)}
            </div>
          ))}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={loading || isPreviewMode}
          className="w-full"
        >
          {isPreviewMode ? "Preview Mode" : loading ? "Submitting..." : "Submit"}
        </Button>
      </CardFooter>
    </Card>
  )
} 