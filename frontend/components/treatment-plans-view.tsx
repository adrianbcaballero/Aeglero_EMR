"use client"

import React from "react"
import { useState } from "react"
import {
  Target,
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  Plus,
  Search,
  ArrowLeft,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
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
import { treatmentPlans, patients } from "@/lib/data"
import type { TreatmentPlan } from "@/lib/data"

const goalStatusConfig: Record<
  string,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  met: {
    label: "Met",
    className: "bg-accent/10 text-accent",
    icon: CheckCircle2,
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-primary/10 text-primary",
    icon: Circle,
  },
  "partially-met": {
    label: "Partially Met",
    className: "bg-chart-4/10 text-chart-4",
    icon: AlertCircle,
  },
  "not-met": {
    label: "Not Met",
    className: "bg-destructive/10 text-destructive",
    icon: AlertCircle,
  },
}

// ------- New Plan Dialog -------
function NewPlanDialog() {
  const [open, setOpen] = useState(false)
  const [patientId, setPatientId] = useState<string | undefined>(undefined)
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [reviewDate, setReviewDate] = useState("")
  const [goalsText, setGoalsText] = useState("")

  const handleCreate = () => {
    // lightweight demo behaviour: log the new plan
    console.log("Create plan", { patientId, title, startDate, reviewDate, goalsText })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 size-4" />
          Treatment plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">New Treatment Plan</DialogTitle>
          <DialogDescription>Fill out basic information to create a treatment plan.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">Patient</Label>
              <Select onValueChange={(v) => setPatientId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{`${p.firstName} ${p.lastName}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">Plan Title</Label>
              <Input placeholder="Short title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-foreground">Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-foreground">Review Date</Label>
                <Input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-foreground">Goals (one per line)</Label>
              <Textarea value={goalsText} onChange={(e) => setGoalsText(e.target.value)} placeholder="Improve sleep\nReduce panic attacks" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="bg-transparent text-foreground">Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ------- Patient Plan Detail Page -------
function PlanDetailPage({
  plan,
  onBack,
}: {
  plan: TreatmentPlan
  onBack: () => void
}) {
  const metGoals = plan.goals.filter((g) => g.status === "met").length
  const totalGoals = plan.goals.length
  const progressPercent = totalGoals > 0 ? (metGoals / totalGoals) * 100 : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <p className="text-xs text-muted-foreground">Treatment Plans</p>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
            {plan.patientName}
          </h1>
        </div>
        <Badge
          variant="secondary"
          className={`ml-auto text-xs ${
            plan.status === "active"
              ? "bg-accent/10 text-accent"
              : plan.status === "completed"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {plan.status}
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold font-heading text-foreground">{totalGoals}</p>
            <p className="text-xs text-muted-foreground">Total Goals</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold font-heading text-accent">{metGoals}</p>
            <p className="text-xs text-muted-foreground">Goals Met</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 text-center">
            <p className="text-lg font-bold font-heading text-primary">{Math.round(progressPercent)}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Next Review</p>
            <p className="text-sm font-medium text-foreground mt-1">{plan.reviewDate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm font-bold text-foreground">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Date Info */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Start Date</p>
            <p className="text-sm font-medium text-foreground mt-1">{plan.startDate}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Next Review</p>
            <p className="text-sm font-medium text-foreground mt-1">{plan.reviewDate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading font-semibold text-foreground">
            Treatment Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {plan.goals.map((goal) => {
              const config = goalStatusConfig[goal.status]
              const StatusIcon = config.icon
              return (
                <div key={goal.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex items-center justify-center size-6 rounded-full ${config.className}`}>
                      <StatusIcon className="size-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground leading-relaxed">{goal.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="secondary" className={`text-[10px] ${config.className}`}>
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Target: {goal.targetDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Target className="mr-1.5 size-3.5" />
              Update Goals
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent">
              Review Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ------- Main Treatment Plans View -------
export function TreatmentPlansView({
  initialPatientId,
}: {
  initialPatientId?: string
}) {
  const [searchQuery, setSearchQuery] = useState("")

  // Auto-select plan if navigated from dashboard with a patient ID
  const initialPlan = initialPatientId
    ? treatmentPlans.find((p) => p.patientId === initialPatientId) || null
    : null

  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(initialPlan)

  const filteredPlans = treatmentPlans.filter((plan) =>
    plan.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (selectedPlan) {
    return (
      <PlanDetailPage
        plan={selectedPlan}
        onBack={() => setSelectedPlan(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
            Treatment Plans
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track patient goals and treatment progress
          </p>
        </div>
        <NewPlanDialog />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Active Plans</p>
            <p className="text-xl font-bold font-heading text-foreground">
              {treatmentPlans.filter((p) => p.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Total Goals</p>
            <p className="text-xl font-bold font-heading text-primary">
              {treatmentPlans.reduce((acc, p) => acc + p.goals.length, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Goals Met</p>
            <p className="text-xl font-bold font-heading text-accent">
              {treatmentPlans.reduce(
                (acc, p) => acc + p.goals.filter((g) => g.status === "met").length,
                0
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Due for Review</p>
            <p className="text-xl font-bold font-heading text-chart-4">
              {treatmentPlans.filter(
                (p) => p.status === "active" && p.reviewDate <= "2026-02-15"
              ).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search treatment plans by patient name or ID..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient plan cards - each clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map((plan) => {
          const metGoals = plan.goals.filter((g) => g.status === "met").length
          const totalGoals = plan.goals.length
          const progressPercent = totalGoals > 0 ? (metGoals / totalGoals) * 100 : 0

          return (
            <Card
              key={plan.id}
              className="border-border/60 cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
              onClick={() => setSelectedPlan(plan)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{plan.patientName}</h3>
                    <p className="text-xs text-muted-foreground">{plan.id}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${
                      plan.status === "active"
                        ? "bg-accent/10 text-accent"
                        : plan.status === "completed"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {plan.status}
                  </Badge>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">
                      {metGoals} of {totalGoals} goals met
                    </span>
                    <span className="text-xs font-medium text-foreground">{Math.round(progressPercent)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-1.5" />
                </div>

                <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>Started {plan.startDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>Review {plan.reviewDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filteredPlans.length === 0 && (
          <Card className="border-border/60 col-span-full">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No treatment plans found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
