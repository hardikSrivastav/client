import { BaseTemplateRequirements, FormQuestion, QuestionType, ValidationRules, FormAudience } from '@/types/forms';
import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { QuestionTypesPanel } from './QuestionTypesPanel';
import { FormPreview } from './FormPreview';
import { QuestionEditor } from './QuestionEditor';
import { GripVertical, Trash2, Type, CheckSquare, CheckSquareIcon, FileText, Calendar, CalendarRange, Hash, ChevronDown, AlertCircle, Users } from 'lucide-react';
import { QUESTION_TYPES, QuestionTypeConfig } from './QuestionTypesPanel';
import { generateBaseTemplateQuestions } from '@/utils/baseTemplateUtils';
import { API_URL } from '@/config';
import { PreferenceQuestion } from './PreferenceQuestion';
import { PreferenceQuestionGroup } from './PreferenceQuestionGroup';
import { ConferenceSelector } from './ConferenceSelector';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { EBPreferenceQuestion } from './EBPreferenceQuestion';
import { FormTypeConfirmationModal } from './FormTypeConfirmationModal';
import { cn } from '@/lib/utils';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useAuth } from '@/context/AuthContext';
import { getUserCurrency } from '@/utils/currency';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';


export interface ExtendedFormTemplate extends FormTemplate {
  _id: string | { $oid: string };
  id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  isEBApplication: boolean;
  isConferenceRegistration: boolean;
  audience: FormAudience;
}

interface FormBuilderProps {
  templateId?: string;
  initialConferenceId?: number;
  initialTemplate?: ExtendedFormTemplate;
  onSave: (template: ExtendedFormTemplate) => Promise<void>;
  onAudienceChange?: (newAudience: FormAudience) => void;
}

interface FormTemplate {
  name: string;
  description: string;
  questions: FormQuestion[];
  baseTemplate?: BaseTemplateRequirements;
  conferenceId?: number;
  isEBApplication: boolean;
  isConferenceRegistration: boolean;
  audience: string;
}

interface AudienceSelectorProps {
  value: FormAudience;
  onChange: (value: FormAudience) => void;
  disabled?: boolean;
  isPreviewMode?: boolean;
}

const AudienceSelector: React.FC<AudienceSelectorProps> = ({ value, onChange, disabled, isPreviewMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'delegate', label: 'For Delegates' },
    { value: 'member', label: 'For EB Members' },
    { value: 'secretariat', label: 'For Secretariat' }
  ];

  const selectedOption = options.find(opt => opt.value === value);

  const handleOptionClick = (e: React.MouseEvent, optionValue: FormAudience) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef} style={{ zIndex: isOpen ? 50 : 1 }}>
      <button
        type="button"
        onClick={(e) => {
          if (disabled || isPreviewMode) return;
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={disabled || isPreviewMode}
        className={`w-full px-3 py-2 text-left bg-white dark:bg-gray-800 border 
          border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none 
          focus:ring-2 focus:ring-blue-500 flex items-center justify-between
          ${(disabled || isPreviewMode) ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-500" />
          <span className="block truncate">
            {selectedOption?.label || 'Select audience'}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border 
            border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={(e) => handleOptionClick(e, option.value as FormAudience)}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 
                dark:hover:bg-blue-900/20 flex items-center gap-2"
            >
              <Users size={16} className="text-gray-500" />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const FormBuilder: React.FC<FormBuilderProps> = ({ 
  templateId,
  initialTemplate,
  onSave,
  onAudienceChange 
}) => {
  const router = useRouter();
  const FORM_DRAFT_KEY = 'form_builder_draft';
  
  // Initialize selectedConferenceId from initialTemplate
  const [selectedConferenceId, setSelectedConferenceId] = useState<number | undefined>(
    initialTemplate?.conferenceId
  );

  const { hasPermission, isLoading: isCheckingPermission, error: permissionError, isSuperAdmin } = usePermissionCheck(
    selectedConferenceId?.toString(), 
    'forms',
    false
  );

  const { user, getAuthHeader } = useAuth();
  const userCurrency = getUserCurrency(user);

  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const [template, setTemplate] = useState<ExtendedFormTemplate>(() => {
    if (initialTemplate) {
      // Ensure we set the selectedConferenceId when initializing with a template
      setSelectedConferenceId(initialTemplate.conferenceId);
      return {
        ...initialTemplate,
        conferenceId: initialTemplate.conferenceId,
        isEBApplication: initialTemplate.isEBApplication || false,
        isConferenceRegistration: initialTemplate.isConferenceRegistration || false,
        audience: (initialTemplate.audience || 'member') as FormAudience
      };
    }
    
    return {
      _id: { $oid: '' },  // Will be set by server
      id: '',  // Will be set by server
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      name: '',
      description: '',
      questions: generateBaseTemplateQuestions(),
      conferenceId: undefined,
      baseTemplate: {
        requiredQuestions: {
          personal: { name: true, email: true, phone: true, delegation: true },
          academic: { institution: true, major: true, graduationYear: true },
          conference: {
            committeePreference: true,
            experienceLevel: true,
            dietaryRestrictions: false,
            emergencyContact: true
          }
        },
        validation: {
          email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          phone: '^\\+?[1-9]\\d{1,14}$',
          graduationYear: {
            min: new Date().getFullYear(),
            max: new Date().getFullYear() + 6
          }
        }
      },
      isEBApplication: false,
      isConferenceRegistration: false,
      audience: 'member' as FormAudience
    };
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFormState = async () => {
      if (!templateId || templateId === 'new') {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/forms/templates/${templateId}/draft`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.draft) {
            console.log('[LOAD DRAFT] Draft data:', data);
            const draftTemplate = data.draft?.draft;
            if (draftTemplate) {
              const templateData = {
                ...draftTemplate,
                _id: draftTemplate._id?.$oid || draftTemplate._id,
                conferenceId: draftTemplate.conference_id || draftTemplate.conferenceId,
                questions: draftTemplate.questions || [],
                isEBApplication: draftTemplate.isEBApplication || false,
                isConferenceRegistration: draftTemplate.isConferenceRegistration || false,
                audience: draftTemplate.audience || 'member' as FormAudience
              };
              
              console.log('[LOAD DRAFT] Processed template data:', templateData);
              setTemplate(templateData);
              setSelectedConferenceId(templateData.conferenceId);
            }
          }
        } else {
          console.error('[LOAD DRAFT] Failed response:', await response.text());
        }
      } catch (error) {
        console.error('[LOAD DRAFT] Failed to load draft:', error);
      }
      setIsLoading(false);
    };

    if (templateId) {
      loadFormState();
    }
  }, [templateId]);

  // Add effect to update template when conference changes
  useEffect(() => {
    setTemplate(prev => ({
      ...prev,
      conferenceId: selectedConferenceId
    }));
  }, [selectedConferenceId]);

  // Add effect to update template when initialTemplate changes
  useEffect(() => {
    if (initialTemplate) {
      setTemplate(prev => ({
        ...prev,
        audience: initialTemplate.audience || 'member',
        isEBApplication: initialTemplate.isEBApplication || false,
        isConferenceRegistration: initialTemplate.isConferenceRegistration || false,
        conferenceId: initialTemplate.conferenceId
      }));
      setSelectedConferenceId(initialTemplate.conferenceId);
    }
  }, [initialTemplate]);

  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showEBConfirmation, setShowEBConfirmation] = useState(false);
  const [showDelegateConfirmation, setShowDelegateConfirmation] = useState(false);
  const [pendingQuestionType, setPendingQuestionType] = useState<QuestionType | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{amount: number, currency: string} | null>(null);

  // Add this effect to fetch payment details when conference is selected
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (selectedConferenceId) {
        try {
          const response = await fetch(
            `${API_URL}/forms/templates/conference/${selectedConferenceId}/payment-details`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            console.log('[FETCH PAYMENT DETAILS] Payment details:', data);
            setPaymentDetails(data);
          }
        } catch (error) {
          console.error('Failed to fetch payment details:', error);
        }
      }
    };

    fetchPaymentDetails();
  }, [selectedConferenceId]);

  const handleAddQuestion = (type: QuestionType) => {
    if (!selectedConferenceId) {
      toast.error('Please select a conference first');
      return;
    }

    // Check if we need to show confirmation
    if (type === 'ebPreference' && !template.isEBApplication) {
      setShowEBConfirmation(true);
      setPendingQuestionType(type);
      return;
    }

    if (type === 'preference' && !template.isConferenceRegistration) {
      setShowDelegateConfirmation(true);
      setPendingQuestionType(type);
      return;
    }

    const newQuestion: FormQuestion = {
      id: generateId(),
      type,
      label: '',
      required: false,
      validation: type === 'paymentVerification' ? {
        allowedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
        maxSize: 5 * 1024 * 1024, // 5MB
        paymentAmount: paymentDetails?.amount || undefined,
        currency: paymentDetails?.currency || userCurrency || 'USD',
        paymentInstructions: ''
      } : {}
    };

    setTemplate(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const handleEBConfirmation = async (confirmed: boolean) => {
    if (confirmed) {
      try {
        // Update form type on backend
        const response = await fetch(`${API_URL}/forms/templates/${templateId}/type`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            isEBApplication: true,
            audience: 'member'
          })
        });

        if (!response.ok) throw new Error('Failed to update form type');
        
        // Update local state
        setTemplate(prev => ({
          ...prev,
          isEBApplication: true,
          audience: 'member'
        }));
      } catch (error) {
        toast.error('Failed to update form type');
        setShowEBConfirmation(false);
        setPendingQuestionType(null);
        return;
      }
    }

    setShowEBConfirmation(false);
    if (confirmed && pendingQuestionType) {
      addQuestionToForm(pendingQuestionType);
    }
    setPendingQuestionType(null);
  };

  const addQuestionToForm = (type: QuestionType) => {
    if (type === 'ebPreference') {
      // Create committee question
      const committeeQuestion: FormQuestion = {
        id: generateId(),
        type: 'ebPreference',
        label: 'Executive Board Committee Preference',
        required: true,
        value: '',
        EBPreferenceConfig: {
          type: 'committee',
          conferenceId: selectedConferenceId || 0
        }
      };

      // Create role question with customizable labels
      const roleQuestion: FormQuestion = {
        id: generateId(),
        type: 'ebPreference',
        label: 'Executive Board Role Preference',
        required: true,
        value: '',
        EBPreferenceConfig: {
          type: 'role',
          conferenceId: selectedConferenceId || 0,
          roleLabels: {
            chair: 'Chair',
            viceChair: 'Vice Chair',
            member: 'Committee Member'
          }
        }
      };

      setTemplate(prev => ({
        ...prev,
        questions: [...prev.questions, committeeQuestion, roleQuestion]
      }));
      setSelectedQuestion(committeeQuestion.id);
      return;
    }
    
    if (type === 'preference') {
      if (!selectedConferenceId) {
        toast.error('Please select a conference first');
        return;
      }
      
      const committeeId = generateId();
      const portfolioId = `${committeeId}-portfolio`;
      
      const committeeQuestion: FormQuestion = {
        id: committeeId,
        type: 'preference',
        label: 'Committee Preference',
        required: true,
        isSystemManaged: true,
        value: '',
        preferenceConfig: {
          maxPreferences: 3,
          minPreferences: 1,
          type: 'committee',
          conferenceId: selectedConferenceId 
        }
      };

      const portfolioQuestion: FormQuestion = {
        id: portfolioId,
        type: 'preference',
        label: 'Portfolio Preference',
        required: true,
        isSystemManaged: true,
        value: '',
        linkedCommitteeId: committeeId,
        preferenceConfig: {
          maxPreferences: 3,
          minPreferences: 1,
          type: 'portfolio',
          conferenceId: selectedConferenceId
        }
      };

      setTemplate(prev => ({
        ...prev,
        questions: [...prev.questions, committeeQuestion, portfolioQuestion]
      }));
      setSelectedQuestion(committeeId);
      return;
    }

    const newQuestion: FormQuestion = {
      id: generateId(),
      type,
      label: '',
      required: false,
      options: type === 'select' || type === 'multiselect' 
        ? [
            { id: '1', label: 'Option 1', value: '1', disabled: false },
            { id: '2', label: 'Option 2', value: '2', disabled: false }
          ] 
        : undefined
    };

    setTemplate(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setSelectedQuestion(newQuestion.id);
  };

  const handleQuestionUpdate = (questionId: string, updates: Partial<FormQuestion>) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const handleValidationUpdate = (questionId: string, validation: ValidationRules) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, validation } : q
      )
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const questions = Array.from(template.questions);
    const [reorderedQuestion] = questions.splice(result.source.index, 1);
    questions.splice(result.destination.index, 0, reorderedQuestion);

    setTemplate(prev => ({ ...prev, questions }));
  };

  const handleDeleteQuestion = (questionId: string) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.filter(q => {
        if (q.type === 'preference') {
          if (q.id === questionId || q.linkedCommitteeId === questionId) {
            return false;
          }
        }
        
        return q.id !== questionId;
      })
    }));
    
    if (selectedQuestion === questionId) {
      setSelectedQuestion(null);
    }
  };

  const canSaveForm = () => {
    if (!template.name.trim()) return false;
    
    if (template.questions.length < 2) return false;
    
    const hasUnlabeledQuestions = template.questions.some(q => !q.label.trim());
    if (hasUnlabeledQuestions) return false;

    return true;
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'preference':
        return 'Preference';
      case 'ebPreference':
        return 'EB Preference';
      case 'text':
        return 'Text';
      case 'email':
        return 'Email';
      case 'phone':
        return 'Phone Number';
      case 'location':
        return 'Location';
      case 'select':
        return 'Select';
      case 'multiselect':
        return 'Multi-select';
      case 'file':
        return 'File Upload';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const handleQuestionTypeChange = (questionId: string, newType: QuestionType) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              type: newType,
              options: newType === 'select' || newType === 'multiselect' ? [] : undefined,
              minDate: undefined,
              maxDate: undefined,
              minValue: undefined,
              maxValue: undefined
            } 
          : q
      )
    }));
  };

  const handleSave = async () => {
    if (!selectedConferenceId) {
      return;
    }
    
    if (!hasPermission && !isCheckingPermission) {
      toast.error("You don't have permission to edit forms for this conference");
      return;
    }
    
    try {
      await onSave({
        ...template,
        conferenceId: selectedConferenceId
      });
      localStorage.removeItem(FORM_DRAFT_KEY);
      
      if (!templateId) {
        return;
      }

      await fetch(`${API_URL}/forms/templates/${templateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          draft: {
            template: {
              ...template,
              conference_id: selectedConferenceId
            }
          }
        })
      });
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  const handleConferenceSelect = async (conferenceId: number) => {
    setSelectedConferenceId(conferenceId);
    const updatedTemplate = {
      ...template,
      conferenceId: conferenceId
    };
    setTemplate(updatedTemplate);

    try {
      await fetch(`${API_URL}/forms/templates/${templateId}/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          draft: {
            template: {
              ...updatedTemplate,
              conference_id: conferenceId
            }
          }
        })
      });
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleAudienceChange = async (newAudience: FormAudience) => {
    if (!templateId) return;
    
    try {
      const response = await fetch(`${API_URL}/forms/templates/${templateId}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ audience: newAudience })
      });

      if (!response.ok) {
        throw new Error('Failed to update form audience');
      }

      setTemplate(prev => ({
        ...prev!,
        audience: newAudience
      }));
      
      // Call the onAudienceChange callback if provided
      if (onAudienceChange) {
        onAudienceChange(newAudience);
      }
      
      toast.success('Form audience updated successfully');
    } catch (error) {
      console.error('Failed to update form audience:', error);
      toast.error('Failed to update form audience');
    }
  };

  useEffect(() => {
    if (!templateId || isLoading) return;
    
    const saveDraft = async () => {
      try {
        await fetch(`${API_URL}/forms/templates/${templateId}/draft`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include',
          body: JSON.stringify({
            draft: {
              template: {
                ...template,
                conference_id: selectedConferenceId
              }
            }
          })
        });
      } catch (error) {
        console.error('Error auto-saving draft:', error);
      }
    };

    const timeoutId = setTimeout(saveDraft, 500);
    return () => clearTimeout(timeoutId);
  }, [template, selectedConferenceId, templateId, isLoading]);

  return (
    <div className="flex-1">
      <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {!isCheckingPermission && !hasPermission && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Read-Only Mode</h3>
                <p className="mt-2 text-sm text-amber-700 dark:text-amber-200">
                  You don't have permission to edit forms for this conference. The form is in read-only mode.
                </p>
                <button 
                  onClick={() => router.back()}
                  className="mt-2 text-sm font-medium text-amber-800 dark:text-amber-300 hover:text-amber-600"
                >
                  ← Go back
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
            <div className="space-y-4 flex-1 w-full">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <input
                  type="text"
                  value={template.name}
                  onChange={e => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Form Name"
                  className="w-full text-xl font-semibold px-3 py-2 border border-gray-300 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={!hasPermission}
                />
                <div className="w-full sm:w-auto mt-2 sm:mt-0">
                  <ConferenceSelector
                    onSelect={handleConferenceSelect}
                    selectedId={selectedConferenceId}
                    initialConferenceId={template.conferenceId}
                  />
                </div>
                <div className="w-full sm:w-auto mt-2 sm:mt-0">
                  <AudienceSelector
                    value={template.audience}
                    onChange={handleAudienceChange}
                    disabled={!hasPermission}
                    isPreviewMode={isPreviewMode}
                  />
                </div>
              </div>
              <textarea
                value={template.description}
                onChange={e => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Form Description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                disabled={!hasPermission}
              />
            </div>
            <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto sm:ml-4">
              {templateId && templateId !== 'new' && (
                <SecondaryButton
                  onClick={() => router.push(`/forms/${templateId}/responses`)}
                  className="w-full sm:w-auto"
                >
                  View Responses
                </SecondaryButton>
              )}
              <SecondaryButton 
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="w-full sm:w-auto"
              >
                {isPreviewMode ? '← Back to Editor' : 'Preview Form →'}
              </SecondaryButton>
            </div>
          </div>
        </div>

        {isPreviewMode ? (
          <FormPreview 
            questions={template.questions.filter(q => !q.linkedCommitteeId)}
            title={template.name}
            description={template.description}
            isPreviewMode={true}
            isSubmittedForm={false}
            isReviewMode={false}
            onSubmit={responses => {
            }}
          />
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Question Types
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                <QuestionTypesPanel onAddQuestion={handleAddQuestion} disabled={!hasPermission} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="questions-list" isDropDisabled={!hasPermission}>
                  {(droppableProvided) => (
                    <div
                      {...droppableProvided.droppableProps}
                      ref={droppableProvided.innerRef}
                    >
                      {template.questions.map((question, index) => {
                        if (question.type === 'preference' && question.linkedCommitteeId) {
                          return null;
                        }

                        return (
                          <Draggable 
                            key={question.id} 
                            draggableId={question.id} 
                            index={index}
                            isDragDisabled={!hasPermission}
                          >
                            {(draggableProvided) => (
                              <div
                                ref={draggableProvided.innerRef}
                                {...draggableProvided.draggableProps}
                              >
                                <div 
                                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                  onClick={(e) => {
                                    if (
                                      e.target instanceof HTMLElement && (
                                        e.target.closest('.dropdown-container') ||
                                        e.target.closest('button') ||
                                        e.target.closest('select') ||
                                        e.target.closest('input') ||
                                        e.target.closest('.option-controls') ||
                                        e.target.closest('.eb-preference-controls')
                                      )
                                    ) {
                                      return;
                                    }
                                    
                                    if (!hasPermission) return;
                                    
                                    setSelectedQuestion(prevSelected => 
                                      prevSelected === question.id ? null : question.id
                                    );
                                  }}
                                >
                                  <div className="flex-1 flex items-center gap-4">
                                    <span {...draggableProvided.dragHandleProps} className={`p-1 ${hasPermission ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'} rounded`}>
                                      <GripVertical className="text-gray-400" size={18} />
                                    </span>
                                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                      <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {question.label || 'Untitled Question'}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1 sm:mt-0">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                          {getQuestionTypeLabel(question.type)}
                                        </span>
                                        {question.required && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                            Required
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {hasPermission && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteQuestion(question.id);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                                        title="Delete question"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                    <ChevronDown 
                                      className={cn(
                                        "w-5 h-5 text-gray-400 transition-transform duration-200",
                                        selectedQuestion === question.id && "transform rotate-180",
                                        !hasPermission && "opacity-50"
                                      )}
                                    />
                                  </div>
                                </div>

                                {selectedQuestion === question.id && (
                                  <div className="mt-4 pl-8">
                                    {question.type === 'ebPreference' ? (
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium mb-2">
                                            {question.EBPreferenceConfig?.type === 'committee' 
                                              ? 'Committee Preference' 
                                              : 'Role Preference'}
                                          </label>
                                          {question.EBPreferenceConfig?.type === 'committee' ? (
                                            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/30">
                                              <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-1">
                                                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                  </svg>
                                                </div>
                                                <div className="text-sm text-amber-800 dark:text-amber-200">
                                                  <p className="font-medium mb-1">Committee Options</p>
                                                  <p>Committee options will be automatically populated based on the committees configured in this conference. To modify available committees, please update the conference details.</p>
                                                </div>
                                              </div>
                                            </div>
                                          ) : null}
                                          <div className="mt-4"> 
                                          <EBPreferenceQuestion
                                            question={question}
                                            value={question.value || ''}
                                            onChange={(value) => {
                                              handleQuestionUpdate(question.id, {
                                                ...question,
                                                value
                                              });
                                            }}
                                            disabled={true || !hasPermission}
                                            conferenceId={selectedConferenceId || 0}
                                            roleLabels={question.EBPreferenceConfig?.roleLabels}
                                          />
                                          </div>
                                        </div>
                                        {question.type === 'ebPreference' && question.EBPreferenceConfig?.type === 'role' && (
                                          <div className="mt-6 space-y-4">
                                            <div className="flex items-center gap-2">
                                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Customize Role Labels
                                              </h4>
                                              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded">
                                                Optional
                                              </div>
                                            </div>
                                            <div className="grid gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                              {['chair', 'viceChair', 'member'].map((role, index) => (
                                                <div key={role} className="flex items-center gap-3">
                                                  <div className="w-18 flex-shrink-0">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                      {`Rank ${index + 1}`}
                                                    </span>
                                                  </div>
                                                  <input
                                                    type="text"
                                                    value={question.EBPreferenceConfig?.roleLabels?.[role] || ''}
                                                    onChange={(e) => {
                                                      handleQuestionUpdate(question.id, {
                                                        ...question,
                                                        EBPreferenceConfig: {
                                                          type: question.EBPreferenceConfig?.type || 'role',
                                                          conferenceId: question.EBPreferenceConfig?.conferenceId || selectedConferenceId || 0,
                                                          roleLabels: {
                                                            ...question.EBPreferenceConfig?.roleLabels,
                                                            [role]: e.target.value
                                                          }
                                                        }
                                                      });
                                                    }}
                                                    className="flex-1 px-3 py-1.5 text-sm border rounded-md 
                                                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                                      dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                                                      placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                                    placeholder={`Enter custom label for ${role.replace('_', ' ')}`}
                                                    disabled={!hasPermission}
                                                  />
                                                </div>
                                              ))}
                                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                Customize how role titles appear to applicants. Leave blank to use default labels.
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : question.type === 'preference' ? (
                                      <PreferenceQuestionGroup
                                        committeeQuestion={question}
                                        portfolioQuestion={template.questions.find(q => q.linkedCommitteeId === question.id)!}
                                        onCommitteeChange={(value) => {
                                          setTemplate(prev => ({
                                            ...prev,
                                            questions: prev.questions.map(q => 
                                              q.id === question.id ? { ...q, value } :
                                              q.linkedCommitteeId === question.id ? { ...q, value: '' } : q
                                            )
                                          }));
                                        }}
                                        onPortfolioChange={(value) => {
                                          const portfolioQuestion = template.questions.find(q => q.linkedCommitteeId === question.id);
                                          if (portfolioQuestion) {
                                            setTemplate(prev => ({
                                              ...prev,
                                              questions: prev.questions.map(q => 
                                                q.id === portfolioQuestion.id ? { ...q, value } : q
                                              )
                                            }));
                                          }
                                        }}
                                        disabled={!hasPermission}
                                      />
                                    ) : !question.linkedCommitteeId && (
                                      <QuestionEditor
                                        question={question}
                                        onChange={(updates) => handleQuestionUpdate(question.id, updates)}
                                        onValidationChange={(validation) => handleValidationUpdate(question.id, validation)}
                                        disabled={!hasPermission}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {droppableProvided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {template.questions.length > 0 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                  {((!canSaveForm() || !selectedConferenceId) && hasPermission) && (
                    <div className="mb-4 text-sm text-amber-600 dark:text-amber-400">
                      <ul className="list-disc list-inside space-y-1">
                        {!selectedConferenceId && (
                          <li>Please select a conference</li>
                        )}
                        {!template.name.trim() && (
                          <li>Please add a form name</li>
                        )}
                        {template.questions.length < 2 && (
                          <li>Add at least two questions</li>
                        )}
                        {template.questions.some(q => !q.label.trim()) && (
                          <li>All questions must have labels</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {hasPermission ? (
                    <button
                      onClick={handleSave}
                      disabled={!canSaveForm() || !selectedConferenceId}
                      className={`w-full px-6 py-2 font-medium rounded-md transition-colors
                        ${canSaveForm() && selectedConferenceId
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                        }
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      Save Form
                    </button>
                  ) : (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      You don't have permission to edit this form
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <FormTypeConfirmationModal
          isOpen={showEBConfirmation}
          onClose={() => {
            setShowEBConfirmation(false);
            setPendingQuestionType(null);
          }}
          onConfirm={() => handleEBConfirmation(true)}
          type="eb"
        />

        <FormTypeConfirmationModal
          isOpen={showDelegateConfirmation}
          onClose={() => {
            setShowDelegateConfirmation(false);
            setPendingQuestionType(null);
          }}
          onConfirm={() => {
            setShowDelegateConfirmation(false);
            if (pendingQuestionType) {
              addQuestionToForm(pendingQuestionType);
            }
            setPendingQuestionType(null);
          }}
          type="delegate"
        />
      </div>
    </div>
  );
};