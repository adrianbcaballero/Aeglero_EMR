"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  Calendar,
  ChevronRight,
  ArrowLeft,
  FileCheck,
  FileClock,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Stethoscope,
  Users,
  Archive,
  PenLine,
  X,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { patients, archivedPatients, patientForms } from "@/lib/data"
import type { Patient, PatientForm } from "@/lib/data"

// ------- Form Questions Data (mock per form) -------
function getFormQuestions(_form: PatientForm) {
  return [
    {
      id: "q1",
      question:
        "Over the last 2 weeks, how often have you been bothered by the following problems?",
      options: ["Not at all", "Several days", "More than half the days"],
    },
    {
      id: "q2",
      question:
        "How would you rate your overall level of functioning this week?",
      options: [
        "Significantly impaired",
        "Somewhat impaired",
        "Functioning well",
      ],
    },
    {
      id: "q3",
      question:
        "Have you experienced any changes in your symptoms since your last visit?",
      options: ["Symptoms worsened", "No change", "Symptoms improved"],
    },
  ]
}

// ------- Status Helpers -------
const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "bg-accent/10 text-accent border-accent/20",
    label: "Completed",
  },
  pending: {
    icon: Clock,
    color: "bg-chart-4/10 text-chart-4 border-chart-4/20",
    label: "Pending",
  },
  "in-progress": {
    icon: Loader2,
    color: "bg-primary/10 text-primary border-primary/20",
    label: "In Progress",
  },
  overdue: {
    icon: AlertCircle,
    color: "bg-destructive/10 text-destructive border-destructive/20",
    label: "Overdue",
  },
}

const categoryLabels: Record<string, string> = {
  intake: "Intake",
  assessment: "Assessment",
  consent: "Consent",
  insurance: "Insurance",
  discharge: "Discharge",
  clinical: "Clinical",
}

// ------- Form Detail View -------
function FormDetailView({
  form,
  patient,
  onBack,
}: {
  form: PatientForm
  patient: Patient
  onBack: () => void
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const questions = getFormQuestions(form)

  const cfg = statusConfig[form.status]
  const StatusIcon = cfg.icon

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <p className="text-xs text-muted-foreground">
            {patient.firstName} {patient.lastName} / Forms
          </p>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
            {form.name}
          </h1>
        </div>
      </div>

      {/* Form Questions */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-heading font-semibold text-foreground">
            Form Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="flex flex-col gap-3">
              <Label className="text-sm font-medium text-foreground leading-relaxed">
                {idx + 1}. {q.question}
              </Label>
              <RadioGroup
                value={answers[q.id] || ""}
                onValueChange={(val) =>
                  setAnswers({ ...answers, [q.id]: val })
                }
                className="flex flex-col gap-2"
              >
                {q.options.map((option) => (
                  <div
                    key={option}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() =>
                      setAnswers({ ...answers, [q.id]: option })
                    }
                  >
                    <RadioGroupItem value={option} id={`${q.id}-${option}`} />
                    <Label
                      htmlFor={`${q.id}-${option}`}
                      className="text-sm text-foreground cursor-pointer flex-1"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}

          <Separator />

          {/* Sign & Submit */}
          <div className="flex items-center gap-3">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <PenLine className="mr-2 size-4" />
              Sign & Submit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Details */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base font-heading font-semibold text-foreground">
            Form Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Form ID</p>
              <p className="text-sm font-medium font-mono text-foreground mt-1">
                {form.id}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="flex items-center gap-1.5 mt-1">
                <StatusIcon className="size-3.5" />
                <span className="text-sm font-medium text-foreground">
                  {cfg.label}
                </span>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {categoryLabels[form.category]}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Assigned Date</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {form.assignedDate}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Due Date</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {form.dueDate}
              </p>
            </div>
            {form.completedDate && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Completed Date</p>
                <p className="text-sm font-medium text-foreground mt-1">
                  {form.completedDate}
                </p>
              </div>
            )}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Patient</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {patient.firstName} {patient.lastName}
              </p>
            </div>
          </div>
          {form.notes && (
            <div className="mt-4 p-3 bg-chart-4/5 border border-chart-4/20 rounded-lg">
              <p className="text-xs font-semibold text-chart-4 mb-1">Notes</p>
              <p className="text-sm text-foreground">{form.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ------- Patient Profile View -------
function PatientProfileView({
  patient,
  onBack,
  onFormClick,
}: {
  patient: Patient
  onBack: () => void
  onFormClick: (form: PatientForm) => void
}) {
  const forms = patientForms.filter((f) => f.patientId === patient.id)
  const completedCount = forms.filter((f) => f.status === "completed").length
  const pendingCount = forms.filter((f) => f.status !== "completed").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Avatar className="size-12">
          {patient.avatar && (
            <AvatarImage
              src={patient.avatar || "/placeholder.svg"}
              alt={`${patient.firstName} ${patient.lastName}`}
            />
          )}
          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
            {patient.firstName[0]}
            {patient.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {patient.id} &middot; {patient.primaryDiagnosis}
            {patient.status === "discharged" && (
              <Badge
                variant="secondary"
                className="ml-2 text-[10px] bg-muted-foreground/10 text-muted-foreground"
              >
                Archived
              </Badge>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">DOB</p>
            <p className="text-sm font-medium text-foreground mt-1">{patient.dateOfBirth}</p>
            <p className="text-xs text-muted-foreground mt-2">Gender</p>
            <p className="text-sm font-medium text-foreground mt-1">{patient.gender}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Height</p>
            <p className="text-sm font-medium text-foreground mt-1">{patient.heightCm ? `${patient.heightCm} cm` : "—"}</p>
            <p className="text-xs text-muted-foreground mt-2">Weight</p>
            <p className="text-sm font-medium text-foreground mt-1">{patient.weightKg ? `${patient.weightKg} kg` : "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Allergies</p>
            <p className="text-sm font-medium text-foreground mt-1">{patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(", ") : "None listed"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList className="size-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">
                Total Forms
              </p>
            </div>
            <p className="text-2xl font-bold font-heading text-foreground">
              {forms.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileCheck className="size-4 text-accent" />
              <p className="text-xs text-muted-foreground font-medium">
                Completed
              </p>
            </div>
            <p className="text-2xl font-bold font-heading text-accent">
              {completedCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileClock className="size-4 text-chart-4" />
              <p className="text-xs text-muted-foreground font-medium">
                Needs Attention
              </p>
            </div>
            <p className="text-2xl font-bold font-heading text-chart-4">
              {pendingCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading font-semibold text-foreground">
            Forms ({forms.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Form Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                  Category
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  Due Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => {
                const cfg = statusConfig[form.status]
                const StatusIcon = cfg.icon
                return (
                  <TableRow
                    key={form.id}
                    className="cursor-pointer transition-colors"
                    onClick={() => onFormClick(form)}
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {form.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {form.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="text-[10px]">
                        {categoryLabels[form.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${cfg.color}`}
                      >
                        <StatusIcon className="mr-1 size-3" />
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {form.dueDate}
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
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-sm text-muted-foreground"
                  >
                    No forms found for this patient.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ------- New Patient Dialog -------
function NewPatientDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 size-4" />
          New Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">
            Add New Patient
          </DialogTitle>
          <DialogDescription>
            Enter the patient information below to create a new record.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">
                First Name
              </Label>
              <Input placeholder="First name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">
                Last Name
              </Label>
              <Input placeholder="Last name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">
                Date of Birth
              </Label>
              <Input type="date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">
                Gender
              </Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-Binary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Phone</Label>
            <Input placeholder="(555) 000-0000" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">Email</Label>
            <Input type="email" placeholder="patient@email.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">
              Insurance
            </Label>
            <Input placeholder="Insurance provider" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">
              Primary Diagnosis
            </Label>
            <Input placeholder="e.g. Major Depressive Disorder" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-foreground">
              Assigned Provider
            </Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chen">Dr. Emily Chen</SelectItem>
                <SelectItem value="torres">Dr. Michael Torres</SelectItem>
                <SelectItem value="hoffman">Dr. Lisa Hoffman</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-transparent text-foreground"
            >
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setOpen(false)}
            >
              Create Patient
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
  initialFilter?: "intake-complete" | "intake-incomplete" | "dr-completion" | null
  initialPatientId?: string
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>(
    initialFilter || "all"
  )

  // Auto-select patient if navigated from dashboard
  const initialPatient = initialPatientId
    ? patients.find((p) => p.id === initialPatientId) ||
      archivedPatients.find((p) => p.id === initialPatientId) ||
      null
    : null

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient)
  const [selectedForm, setSelectedForm] = useState<PatientForm | null>(null)

  // Filter helpers
  const getPatientIntakeForms = (patientId: string) =>
    patientForms.filter(
      (f) => f.patientId === patientId && f.category === "intake"
    )
  const getPatientDrForms = (patientId: string) =>
    patientForms.filter(
      (f) =>
        f.patientId === patientId &&
        (f.category === "clinical" || f.category === "assessment") &&
        f.status !== "completed"
    )

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      `${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.primaryDiagnosis
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeFilter === "intake-complete") {
      const intakeForms = getPatientIntakeForms(patient.id)
      return (
        intakeForms.length > 0 &&
        intakeForms.every((f) => f.status === "completed")
      )
    }
    if (activeFilter === "intake-incomplete") {
      const intakeForms = getPatientIntakeForms(patient.id)
      return (
        intakeForms.length === 0 ||
        intakeForms.some((f) => f.status !== "completed")
      )
    }
    if (activeFilter === "dr-completion") {
      return getPatientDrForms(patient.id).length > 0
    }
    return true
  })

  if (selectedForm && selectedPatient) {
    return (
      <FormDetailView
        form={selectedForm}
        patient={selectedPatient}
        onBack={() => setSelectedForm(null)}
      />
    )
  }

  if (selectedPatient) {
    return (
      <PatientProfileView
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
        onFormClick={(form) => setSelectedForm(form)}
      />
    )
  }

  const getFormStats = (patientId: string) => {
    const forms = patientForms.filter((f) => f.patientId === patientId)
    const completed = forms.filter((f) => f.status === "completed").length
    const needsAttention = forms.filter(
      (f) => f.status !== "completed"
    ).length
    return { total: forms.length, completed, needsAttention }
  }

  // Compute stats
  const allIntakeForms = patientForms.filter((f) => f.category === "intake")
  const intakeCompleted = allIntakeForms.filter(
    (f) => f.status === "completed"
  ).length
  const intakeIncomplete = allIntakeForms.filter(
    (f) => f.status !== "completed"
  ).length
  const requiresDoctorCompletion = patientForms.filter(
    (f) =>
      (f.category === "clinical" || f.category === "assessment") &&
      f.status !== "completed"
  ).length
  const totalActive = patients.filter((p) => p.status === "active").length
  const totalArchived = archivedPatients.length

  const filters = [
    { key: "all", label: "All Active" },
    { key: "intake-complete", label: "Intake Complete" },
    { key: "intake-incomplete", label: "Intake Incomplete" },
    { key: "dr-completion", label: "Dr. Completion Needed" },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
            Patients
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your patient roster and track form completion
          </p>
        </div>
        <NewPatientDialog />
      </div>

      {/* Quick Stats - 5 categories */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <FileCheck className="size-3.5 text-accent" />
              <p className="text-xs text-muted-foreground font-medium">
                Intake Complete
              </p>
            </div>
            <p className="text-xl font-bold font-heading text-accent">
              {intakeCompleted}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <FileClock className="size-3.5 text-chart-4" />
              <p className="text-xs text-muted-foreground font-medium">
                Intake Incomplete
              </p>
            </div>
            <p className="text-xl font-bold font-heading text-chart-4">
              {intakeIncomplete}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Stethoscope className="size-3.5 text-primary" />
              <p className="text-xs text-muted-foreground font-medium">
                {"Dr. Completion"}
              </p>
            </div>
            <p className="text-xl font-bold font-heading text-primary">
              {requiresDoctorCompletion}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="size-3.5 text-foreground" />
              <p className="text-xs text-muted-foreground font-medium">
                Total Active
              </p>
            </div>
            <p className="text-xl font-bold font-heading text-foreground">
              {totalActive}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Archive className="size-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">
                Total Archived
              </p>
            </div>
            <p className="text-xl font-bold font-heading text-muted-foreground">
              {totalArchived}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="size-3.5 text-muted-foreground" />
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={activeFilter === f.key ? "default" : "outline"}
              size="sm"
              className={
                activeFilter === f.key
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-7"
                  : "bg-transparent text-foreground text-xs h-7"
              }
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
              {activeFilter === f.key && f.key !== "all" && (
                <X
                  className="ml-1 size-3"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveFilter("all")
                  }}
                />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Patients Table */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading font-semibold text-foreground">
            Active Patients ({filteredPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Patient
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                  Diagnosis
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  Provider
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Forms
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => {
                const stats = getFormStats(patient.id)
                return (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer transition-colors"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          {patient.avatar && (
                            <AvatarImage
                              src={patient.avatar || "/placeholder.svg"}
                              alt={`${patient.firstName} ${patient.lastName}`}
                            />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {patient.firstName[0]}
                            {patient.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {patient.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-foreground">
                        {patient.primaryDiagnosis}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {patient.assignedProvider}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-accent/10 text-accent"
                        >
                          {stats.completed}/{stats.total}
                        </Badge>
                        {stats.needsAttention > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-chart-4/10 text-chart-4"
                          >
                            {stats.needsAttention} pending
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredPatients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-sm text-muted-foreground"
                  >
                    No patients match the current filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Archived Patients */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Archive className="size-4 text-muted-foreground" />
            <CardTitle className="text-base font-heading font-semibold text-foreground">
              Archived Patients ({archivedPatients.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Patient
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                  Diagnosis
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  Last Visit
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">
                  Provider
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {archivedPatients.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer transition-colors"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-muted-foreground/10 text-muted-foreground text-xs">
                          {patient.firstName[0]}
                          {patient.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {patient.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-foreground">
                      {patient.primaryDiagnosis}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {patient.lastVisit}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {patient.assignedProvider}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
