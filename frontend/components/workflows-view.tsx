"use client"

import { useState } from "react"
import {
  GitBranch,
  Search,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Loader2,
  ClipboardList,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { patientForms } from "@/lib/data"

interface FormTemplate {
  id: string
  name: string
  category: string
  description: string
  fields: { label: string; type: string }[]
  usedCount: number
}

const formTemplates: FormTemplate[] = [
  {
    id: "TPL-001",
    name: "New Patient Intake Form",
    category: "Intake",
    description: "Standard intake form for new patients including demographics, medical history, insurance information, and emergency contacts.",
    fields: [
      { label: "Full Name", type: "Text" },
      { label: "Date of Birth", type: "Date" },
      { label: "Primary Insurance", type: "Text" },
      { label: "Emergency Contact", type: "Text" },
      { label: "Reason for Visit", type: "Textarea" },
      { label: "Medical History", type: "Textarea" },
      { label: "Current Medications", type: "Textarea" },
      { label: "Consent Acknowledgment", type: "Checkbox" },
    ],
    usedCount: 8,
  },
  {
    id: "TPL-002",
    name: "PHQ-9 Depression Screening",
    category: "Assessment",
    description: "Patient Health Questionnaire-9 for screening, diagnosing, monitoring, and measuring severity of depression.",
    fields: [
      { label: "Little interest or pleasure", type: "Scale 0-3" },
      { label: "Feeling down or depressed", type: "Scale 0-3" },
      { label: "Trouble falling/staying asleep", type: "Scale 0-3" },
      { label: "Feeling tired or little energy", type: "Scale 0-3" },
      { label: "Poor appetite or overeating", type: "Scale 0-3" },
      { label: "Feeling bad about yourself", type: "Scale 0-3" },
      { label: "Trouble concentrating", type: "Scale 0-3" },
      { label: "Moving or speaking slowly", type: "Scale 0-3" },
      { label: "Thoughts of self-harm", type: "Scale 0-3" },
    ],
    usedCount: 2,
  },
  {
    id: "TPL-003",
    name: "GAD-7 Anxiety Assessment",
    category: "Assessment",
    description: "Generalized Anxiety Disorder 7-item scale for screening and measuring severity of generalized anxiety disorder.",
    fields: [
      { label: "Feeling nervous or on edge", type: "Scale 0-3" },
      { label: "Not being able to stop worrying", type: "Scale 0-3" },
      { label: "Worrying too much", type: "Scale 0-3" },
      { label: "Trouble relaxing", type: "Scale 0-3" },
      { label: "Being so restless", type: "Scale 0-3" },
      { label: "Becoming easily annoyed", type: "Scale 0-3" },
      { label: "Feeling afraid", type: "Scale 0-3" },
    ],
    usedCount: 3,
  },
  {
    id: "TPL-004",
    name: "Informed Consent for Treatment",
    category: "Consent",
    description: "Standard informed consent document covering treatment procedures, risks, benefits, confidentiality, and patient rights.",
    fields: [
      { label: "Patient Name", type: "Text" },
      { label: "Treatment Type", type: "Select" },
      { label: "Risks Acknowledgment", type: "Checkbox" },
      { label: "Benefits Acknowledgment", type: "Checkbox" },
      { label: "Confidentiality Agreement", type: "Checkbox" },
      { label: "Patient Signature", type: "Signature" },
      { label: "Date", type: "Date" },
    ],
    usedCount: 5,
  },
  {
    id: "TPL-005",
    name: "Insurance Authorization Form",
    category: "Insurance",
    description: "Form for requesting prior authorization from insurance carriers for continued treatment sessions.",
    fields: [
      { label: "Patient Name", type: "Text" },
      { label: "Insurance ID", type: "Text" },
      { label: "Diagnosis Code", type: "Text" },
      { label: "Requested Sessions", type: "Number" },
      { label: "Clinical Justification", type: "Textarea" },
      { label: "Provider Signature", type: "Signature" },
    ],
    usedCount: 3,
  },
  {
    id: "TPL-006",
    name: "Safety Plan Worksheet",
    category: "Clinical",
    description: "Collaborative safety planning tool for patients at risk, including warning signs, coping strategies, and emergency contacts.",
    fields: [
      { label: "Warning Signs", type: "Textarea" },
      { label: "Internal Coping Strategies", type: "Textarea" },
      { label: "People Who Provide Distraction", type: "Textarea" },
      { label: "People to Ask for Help", type: "Textarea" },
      { label: "Professionals to Contact", type: "Textarea" },
      { label: "Making Environment Safe", type: "Textarea" },
      { label: "Patient Signature", type: "Signature" },
    ],
    usedCount: 2,
  },
]

// ------- Template Detail Page -------
function TemplateDetailPage({
  template,
  onBack,
}: {
  template: FormTemplate
  onBack: () => void
}) {
  const associatedForms = patientForms.filter((f) => f.name === template.name)
  const statusConfig = {
    completed: { icon: CheckCircle2, color: "bg-accent/10 text-accent", label: "Completed" },
    pending: { icon: Clock, color: "bg-chart-4/10 text-chart-4", label: "Pending" },
    "in-progress": { icon: Loader2, color: "bg-primary/10 text-primary", label: "In Progress" },
    overdue: { icon: AlertCircle, color: "bg-destructive/10 text-destructive", label: "Overdue" },
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Workflows / Templates</p>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
            {template.name}
          </h1>
        </div>
        <Badge variant="secondary" className="text-xs">{template.category}</Badge>
      </div>

      {/* Description */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <p className="text-sm text-foreground leading-relaxed">{template.description}</p>
        </CardContent>
      </Card>

      {/* Template Fields */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading font-semibold text-foreground">
            Template Fields ({template.fields.length})
          </CardTitle>
          <CardDescription>The structure and fields used in this form template</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {template.fields.map((field, idx) => (
              <div
                key={field.label}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono w-5">{idx + 1}.</span>
                  <span className="text-sm font-medium text-foreground">{field.label}</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                  {field.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Associated Form Instances */}
      {associatedForms.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading font-semibold text-foreground">
              Active Instances ({associatedForms.length})
            </CardTitle>
            <CardDescription>Patient forms using this template</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {associatedForms.map((form) => {
                const cfg = statusConfig[form.status]
                const StatusIcon = cfg.icon
                return (
                  <div key={form.id} className="flex items-center gap-3 px-6 py-3">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{form.id}</p>
                      <p className="text-xs text-muted-foreground">Patient: {form.patientId}</p>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] ${cfg.color}`}>
                      <StatusIcon className="mr-1 size-3" />
                      {cfg.label}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ------- New Workflow Dialog -------
function NewWorkflowDialog() {
  const [open, setOpen] = useState(false)
  const [fields, setFields] = useState([{ label: "", type: "Text" }])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 size-4" />
          Workflow
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">
            Create New Workflow Template
          </DialogTitle>
          <DialogDescription>
            Define a new form template for use across the system.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Template Name</Label>
            <Input placeholder="e.g. Patient Follow-Up Assessment" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Category</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intake">Intake</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="consent">Consent</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="clinical">Clinical</SelectItem>
                <SelectItem value="discharge">Discharge</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Description</Label>
            <Textarea placeholder="Describe the purpose of this workflow template..." className="min-h-[60px]" />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Fields</Label>
            {fields.map((field, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder="Field label"
                  value={field.label}
                  onChange={(e) => {
                    const updated = [...fields]
                    updated[idx].label = e.target.value
                    setFields(updated)
                  }}
                  className="flex-1"
                />
                <Select
                  value={field.type}
                  onValueChange={(val) => {
                    const updated = [...fields]
                    updated[idx].type = val
                    setFields(updated)
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Text">Text</SelectItem>
                    <SelectItem value="Textarea">Textarea</SelectItem>
                    <SelectItem value="Number">Number</SelectItem>
                    <SelectItem value="Date">Date</SelectItem>
                    <SelectItem value="Select">Select</SelectItem>
                    <SelectItem value="Checkbox">Checkbox</SelectItem>
                    <SelectItem value="Scale 0-3">Scale 0-3</SelectItem>
                    <SelectItem value="Signature">Signature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-foreground self-start"
              onClick={() => setFields([...fields, { label: "", type: "Text" }])}
            >
              <Plus className="mr-1 size-3" />
              Add Field
            </Button>
          </div>
          <Separator />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="bg-transparent text-foreground">
              Cancel
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOpen(false)}>
              Create Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ------- Main Workflows View -------
export function WorkflowsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null)

  if (selectedTemplate) {
    return (
      <TemplateDetailPage
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
      />
    )
  }

  const filteredTemplates = formTemplates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalInstances = patientForms.length
  const completedInstances = patientForms.filter((f) => f.status === "completed").length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All form templates and their associated patient instances
          </p>
        </div>
        <NewWorkflowDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <ClipboardList className="size-3.5 text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Templates</p>
            </div>
            <p className="text-xl font-bold font-heading text-foreground">{formTemplates.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <FileText className="size-3.5 text-foreground" />
              <p className="text-xs text-muted-foreground font-medium">Total Instances</p>
            </div>
            <p className="text-xl font-bold font-heading text-foreground">{totalInstances}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="size-3.5 text-accent" />
              <p className="text-xs text-muted-foreground font-medium">Completed</p>
            </div>
            <p className="text-xl font-bold font-heading text-accent">{completedInstances}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="size-3.5 text-chart-4" />
              <p className="text-xs text-muted-foreground font-medium">Pending</p>
            </div>
            <p className="text-xl font-bold font-heading text-chart-4">{totalInstances - completedInstances}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name or category..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="border-border/60 cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
            onClick={() => setSelectedTemplate(template)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GitBranch className="size-4 text-primary shrink-0" />
                  <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mt-2">{template.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{template.description}</p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                <span>{template.fields.length} fields</span>
                <span>&middot;</span>
                <span>{template.usedCount} instances</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
