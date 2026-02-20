"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  ChevronRight,
  PenLine,
  ArrowLeft,
  Users,
  AlertTriangle,
  Loader2,
  FileCheck,
  FileClock,
  ClipboardList,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { getPatients, getPatient, createPatient, getPatientForms, getPatientForm, createPatientForm, updatePatientForm, getTemplates} from "@/lib/api"
import type { Patient, PatientDetail, PatientFormEntry, FormTemplate, TemplateField } from "@/lib/api"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

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


const riskColors: Record<string, string> = {
  low: "bg-accent/10 text-accent border-accent/20",
  moderate: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
}

interface FormStatusEntry {
  icon: typeof CheckCircle2
  color: string
  label: string
}

const formStatusConfig: Record<string, FormStatusEntry> = {
  completed: { icon: CheckCircle2, color: "bg-accent/10 text-accent border-accent/20", label: "Completed" },
  draft: { icon: Clock, color: "bg-chart-4/10 text-chart-4 border-chart-4/20", label: "Draft" },
}

// ─── Field Renderer ───
function FormFieldRenderer({ field, value, onChange }: { field: TemplateField; value: unknown; onChange: (v: string | number | string[]) => void }) {
  switch (field.type) {
    case "text":
      return <Input value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.label} />
    case "textarea":
      return <Textarea value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.label} className="min-h-[80px]" />
    case "number":
      return <Input type="number" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.label} />
    case "date":
      return <Input type="date" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} />

    case "checkbox": {
      const opts = field.options || ["Yes", "No"]
      const cur = (value as string) || ""
      return (
        <div className="flex gap-3">
          {opts.map((o) => (
            <label key={o} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={cur === o} onCheckedChange={() => onChange(o)} />
              <span className="text-sm text-foreground">{o}</span>
            </label>
          ))}
        </div>
      )
    }

    case "checkbox_group": {
      const opts = field.options || []
      const sel = Array.isArray(value) ? (value as string[]) : []
      return (
        <div className="flex flex-col gap-2">
          {opts.map((o) => (
            <label key={o} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={sel.includes(o)}
                onCheckedChange={(c) => onChange(c ? [...sel, o] : sel.filter((s) => s !== o))}
              />
              <span className="text-sm text-foreground">{o}</span>
            </label>
          ))}
        </div>
      )
    }

    case "select": {
      const opts = field.options || []
      return (
        <Select value={(value as string) || ""} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
          <SelectContent>
            {opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      )
    }

    case "scale": {
      const mn = field.min ?? 0
      const mx = field.max ?? 3
      const cur = typeof value === "number" ? value : -1
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {Array.from({ length: mx - mn + 1 }, (_, i) => i + mn).map((n) => (
              <button
                key={n} type="button"
                className={`size-10 rounded-lg border text-sm font-medium transition-colors ${cur === n ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-foreground border-border hover:bg-muted"}`}
                onClick={() => onChange(n)}
              >{n}</button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{mn} = Not at all</span><span>{mx} = Nearly every day</span>
          </div>
        </div>
      )
    }

    case "signature":
      return (
        <div className="flex flex-col gap-2">
          <Input value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder="Type full name as signature" className="italic" />
          {!!value && <p className="text-xs text-muted-foreground">Signed electronically on {new Date().toLocaleDateString()}</p>}
        </div>
      )

    default:
      return <Input value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.label} />
  }
}

// ─── Form Detail View ───
function FormDetailView({
  formId, patientCode, patientName, onBack,
}: {
  formId: number; patientCode: string; patientName: string; onBack: () => void
}) {
  const [form, setForm] = useState<PatientFormEntry | null>(null)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saveMsg, setSaveMsg] = useState("")

  useEffect(() => {
    getPatientForm(patientCode, formId)
      .then((f) => { setForm(f); setFormData(f.formData || {}) })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false))
  }, [patientCode, formId])

  const handleSave = (newStatus?: string) => {
    setSaving(true)
    setSaveMsg("")
    const payload: { formData: Record<string, unknown>; status?: string } = { formData }
    if (newStatus) payload.status = newStatus
    updatePatientForm(patientCode, formId, payload)
      .then((u) => { setForm(u); setSaveMsg(newStatus === "completed" ? "Form completed!" : "Saved!") })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Save failed"))
      .finally(() => setSaving(false))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-destructive">{error || "Form not found"}</p>
        <Button variant="outline" className="mt-3 bg-transparent text-foreground" onClick={onBack}>Back</Button>
      </div>
    )
  }

  const fields = form.templateFields || []
  const cfg = formStatusConfig[form.status] || formStatusConfig["draft"]
  const StatusIcon = cfg.icon

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{patientName} / Forms</p>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">{form.templateName}</h1>
        </div>
        <Badge variant="secondary" className={`text-xs ${cfg.color}`}>
          <StatusIcon className="mr-1 size-3" />{cfg.label}
        </Badge>
      </div>

      {/* Fields Card */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-heading font-semibold text-foreground">Form Fields</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {fields.map((field, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">{idx + 1}. {field.label}</Label>
              <FormFieldRenderer
                field={field}
                value={formData[field.label]}
                onChange={(val) => { setFormData((p) => ({ ...p, [field.label]: val })); setSaveMsg("") }}
              />
            </div>
          ))}
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No fields defined for this template.</p>
          )}

          <Separator />

          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-transparent text-foreground" onClick={() => handleSave()} disabled={saving}>
              {saving ? "Saving…" : "Save Draft"}
            </Button>
            {form.status !== "completed" && (
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleSave("completed")} disabled={saving}>
                <PenLine className="mr-2 size-4" />{saving ? "Saving…" : "Sign & Complete"}
              </Button>
            )}
            {saveMsg && <span className="text-sm text-accent">{saveMsg}</span>}
          </div>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-heading font-semibold text-foreground">Form Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Form ID</p>
              <p className="text-sm font-medium font-mono text-foreground mt-1">{form.id}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="flex items-center gap-1.5 mt-1">
                <StatusIcon className="size-3.5" />
                <span className="text-sm font-medium text-foreground">{cfg.label}</span>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-medium text-foreground mt-1 capitalize">{form.templateCategory || "—"}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium text-foreground mt-1">{form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "—"}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium text-foreground mt-1">{form.updatedAt ? new Date(form.updatedAt).toLocaleDateString() : "—"}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Filled By</p>
              <p className="text-sm font-medium text-foreground mt-1">{form.filledByName || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── New Form Dialog ───
function NewFormDialog({ patientCode, onCreated }: { patientCode: string; onCreated: (formId: number) => void }) {
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<FormTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      getTemplates()
        .then((t) => setTemplates(t.filter((tpl) => tpl.status === "active")))
        .catch(() => {})
    }
  }, [open])

  const handleCreate = () => {
    if (!selectedTemplate) {
      setError("Please select a form template")
      return
    }
    setLoading(true)
    setError("")
    createPatientForm(patientCode, { templateId: parseInt(selectedTemplate), formData: {}, status: "draft" })
      .then((form) => {
        setOpen(false)
        setSelectedTemplate("")
        onCreated(form.id)
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to create"))
      .finally(() => setLoading(false))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-1.5 size-3.5" /> Add Form
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">Add Form</DialogTitle>
          <DialogDescription>Select a template to create a new form for this patient.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a form template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    <div className="flex items-center gap-2">
                      <span>{t.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">({t.category})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (() => {
            const tpl = templates.find((t) => t.id === parseInt(selectedTemplate))
            if (!tpl) return null
            return (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-foreground">{tpl.name}</p>
                {tpl.description && <p className="text-xs text-muted-foreground mt-1">{tpl.description}</p>}
                <p className="text-xs text-muted-foreground mt-1">{tpl.fields.length} fields</p>
              </div>
            )
          })()}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="bg-transparent text-foreground" disabled={loading}>
              Cancel
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCreate} disabled={loading}>
              {loading ? "Creating…" : "Create Form"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ------- Patient Profile View -------
function PatientProfileView({
  patientId,
  onBack,
}: {
  patientId: string
  onBack: () => void
}) {
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [forms, setForms] = useState<PatientFormEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingForms, setLoadingForms] = useState(true)
  const [error, setError] = useState("")
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    setError("")
    getPatient(patientId)
      .then(setPatient)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [patientId])

  const fetchForms = () => {
    setLoadingForms(true)
    getPatientForms(patientId)
      .then(setForms)
      .catch(() => {})
      .finally(() => setLoadingForms(false))
  }

  useEffect(() => {
    fetchForms()
  }, [patientId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm text-destructive">{error || "Patient not found"}</p>
        <Button variant="outline" onClick={onBack} className="bg-transparent text-foreground">
          <ArrowLeft className="mr-2 size-4" /> Back
        </Button>
      </div>
    )
  }

  if (selectedFormId) {
    return (
      <FormDetailView
        formId={selectedFormId}
        patientCode={patient.id}
        patientName={`${patient.firstName} ${patient.lastName}`}
        onBack={() => { setSelectedFormId(null); fetchForms() }}
      />
    )
  }

  const completedCount = forms.filter((f) => f.status === "completed").length
  const draftCount = forms.filter((f) => f.status === "draft").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="size-4" />
        </Button>
        <Avatar className="size-12">
          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
            {patient.firstName[0]}{patient.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {patient.id} &middot; {patient.primaryDiagnosis || "No diagnosis"}
          </p>
        </div>
        <Badge variant="secondary" className={`ml-auto text-xs ${riskColors[patient.riskLevel] || ""}`}>
          {patient.riskLevel} risk
        </Badge>
      </div>

      {/* Patient Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Date of Birth</p>
            <p className="text-sm font-medium text-foreground mt-1">{patient.dateOfBirth || "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">Status</p>
            <p className="text-sm font-medium text-foreground mt-1 capitalize">{patient.status}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="text-sm font-medium text-foreground mt-1">{patient.phone || "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">Email</p>
            <p className="text-sm font-medium text-foreground mt-1">{patient.email || "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Insurance</p>
            <p className="text-sm font-medium text-foreground mt-1">{patient.insurance || "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">Provider</p>
            <p className="text-sm font-medium text-foreground mt-1">{patient.assignedProvider || "Unassigned"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Form Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="size-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">Total Forms</p>
            </div>
            <p className="text-2xl font-bold font-heading text-foreground">{forms.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileCheck className="size-4 text-accent" />
              <p className="text-xs text-muted-foreground font-medium">Completed</p>
            </div>
            <p className="text-2xl font-bold font-heading text-accent">{completedCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileClock className="size-4 text-chart-4" />
              <p className="text-xs text-muted-foreground font-medium">Drafts</p>
            </div>
            <p className="text-2xl font-bold font-heading text-chart-4">{draftCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Forms Table */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-heading font-semibold text-foreground">
              Forms ({forms.length})
            </CardTitle>
            <NewFormDialog
              patientCode={patient.id}
              onCreated={(formId) => { fetchForms(); setSelectedFormId(formId) }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingForms ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground">Form Name</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form) => {
                  const fc = formStatusConfig[form.status] || formStatusConfig["draft"]
                  const FIcon = fc.icon
                  return (
                    <TableRow key={form.id} className="cursor-pointer transition-colors" onClick={() => setSelectedFormId(form.id)}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{form.templateName}</p>
                          <p className="text-xs text-muted-foreground">#{form.id}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary" className="text-[10px] capitalize">{form.templateCategory}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] ${fc.color}`}>
                          <FIcon className="mr-1 size-3" />{fc.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  )
                })}
                {forms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                      No forms yet for this patient.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Treatment Plan */}
      {patient.treatmentPlan && (
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading font-semibold text-foreground">
              Treatment Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="text-sm font-medium text-foreground mt-1">{patient.treatmentPlan.startDate || "—"}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Review Date</p>
                <p className="text-sm font-medium text-foreground mt-1">{patient.treatmentPlan.reviewDate || "—"}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium text-foreground mt-1 capitalize">{patient.treatmentPlan.status}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {(patient.treatmentPlan.goals || []).map((g, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <span className="text-xs font-medium text-muted-foreground w-6">{idx + 1}.</span>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{g.goal}</p>
                    <p className="text-xs text-muted-foreground">Target: {g.target}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ------- New Patient Dialog -------
function NewPatientDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [dob, setDob] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [insurance, setInsurance] = useState("")
  const [diagnosis, setDiagnosis] = useState("")

  const resetForm = () => {
    setFirstName("")
    setLastName("")
    setDob("")
    setPhone("")
    setEmail("")
    setInsurance("")
    setDiagnosis("")
    setError("")
  }

  const handleCreate = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required")
      return
    }

    setLoading(true)
    setError("")

    try {
      await createPatient({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dob || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        insurance: insurance.trim() || undefined,
        primaryDiagnosis: diagnosis.trim() || undefined,
      })
      resetForm()
      setOpen(false)
      onCreated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create patient")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm() }}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 size-4" />
          New Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">Add New Patient</DialogTitle>
          <DialogDescription>Enter the patient information below to create a new record.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">First Name *</Label>
              <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">Last Name *</Label>
              <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={loading} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Date of Birth</Label>
            <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} disabled={loading} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Phone</Label>
            <Input placeholder="(555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Email</Label>
            <Input type="email" placeholder="patient@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Insurance</Label>
            <Input placeholder="Insurance provider" value={insurance} onChange={(e) => setInsurance(e.target.value)} disabled={loading} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Primary Diagnosis</Label>
            <Input placeholder="e.g. Major Depressive Disorder" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} disabled={loading} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Separator />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="bg-transparent text-foreground" disabled={loading}>
              Cancel
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCreate} disabled={loading}>
              {loading ? "Creating…" : "Create Patient"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ------- Main Patients View -------
export function PatientsView({
  initialFilter,
  initialPatientId,
}: {
  initialFilter?: string | null
  initialPatientId?: string
}) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [riskFilter, setRiskFilter] = useState<string>("")
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(initialPatientId || null)

  const fetchPatients = () => {
    setLoading(true)
    setError("")
    getPatients()
      .then(setPatients)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  // If viewing a patient profile
  if (selectedPatientId) {
    return (
      <PatientProfileView
        patientId={selectedPatientId}
        onBack={() => setSelectedPatientId(null)}
      />
    )
  }

  // Filter patients client-side
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.primaryDiagnosis || "").toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || p.status === statusFilter
    const matchesRisk = !riskFilter || p.riskLevel === riskFilter

    return matchesSearch && matchesStatus && matchesRisk
  })

  // Stats from real data
  const activeCount = patients.filter((p) => p.status === "active").length
  const highRiskCount = patients.filter((p) => p.riskLevel === "high").length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your patient roster</p>
        </div>
        <NewPatientDialog onCreated={fetchPatients} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="size-3.5 text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Total Patients</p>
            </div>
            <p className="text-xl font-bold font-heading text-foreground">{patients.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="size-3.5 text-accent" />
              <p className="text-xs text-muted-foreground font-medium">Active</p>
            </div>
            <p className="text-xl font-bold font-heading text-accent">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="size-3.5 text-destructive" />
              <p className="text-xs text-muted-foreground font-medium">High Risk</p>
            </div>
            <p className="text-xl font-bold font-heading text-destructive">{highRiskCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={(v) => setRiskFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" className="mt-3 bg-transparent text-foreground" onClick={fetchPatients}>
            Retry
          </Button>
        </div>
      )}

      {/* Patient Table */}
      {!loading && !error && (
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading font-semibold text-foreground">
              Patients ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground">Patient</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">Diagnosis</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">Provider</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Risk</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer transition-colors"
                    onClick={() => setSelectedPatientId(patient.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{patient.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-foreground">{patient.primaryDiagnosis || "—"}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{patient.assignedProvider || "Unassigned"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-[10px] capitalize ${riskColors[patient.riskLevel] || ""}`}>
                        {patient.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                      No patients match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}