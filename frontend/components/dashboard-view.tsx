"use client"

import { useState } from "react"
import {
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  FolderOpen,
  ChevronRight,
  ClipboardCheck,
  ClipboardX,
  Calendar,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  dashboardStats,
  diagnosisDistribution,
  patients,
  clinicalNotes,
  patientForms,
} from "@/lib/data"
import type { Patient } from "@/lib/data"
import type { UserRole } from "@/components/login-page"
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"
import React from "react"

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  subtitle,
  onClick,
}: {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ComponentType<{ className?: string }>
  subtitle?: string
  onClick?: () => void
}) {
  return (
    <Card
      className={`border-border/60 ${onClick ? "cursor-pointer hover:border-primary/40 transition-colors" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold font-heading tracking-tight text-foreground">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-0.5">
                {changeType === "positive" && <ArrowUpRight className="size-3.5 text-accent" />}
                <span
                  className={`text-xs font-medium ${
                    changeType === "positive"
                      ? "text-accent"
                      : changeType === "negative"
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }`}
                >
                  {change}
                </span>
              </div>
            )}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Technician Dashboard ---
function TechnicianDashboard({
  onNavigate,
}: {
  onNavigate?: (tab: string, options?: { filter?: string; patientId?: string }) => void
}) {
  const allIntakeForms = patientForms.filter((f) => f.category === "intake")
  const intakeComplete = allIntakeForms.filter((f) => f.status === "completed").length
  const intakeIncomplete = allIntakeForms.filter((f) => f.status !== "completed").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
          Good morning, Sarah
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {"Here's your intake overview for February 10, 2026"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Intakes Complete"
          value={intakeComplete}
          icon={ClipboardCheck}
          subtitle="All intake forms submitted"
        />
        <StatCard
          title="Intakes Incomplete"
          value={intakeIncomplete}
          icon={ClipboardX}
          subtitle="Click to view patients"
          onClick={() => onNavigate?.("Patients", { filter: "intake-incomplete" })}
        />
      </div>
    </div>
  )
}

// --- Admin Dashboard ---
function AdminDashboard() {
  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
          Good morning, Admin
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="System Uptime"
          value="99.9%"
          icon={Shield}
          subtitle="Last 30 days"
        />
        <StatCard
          title="Active Users"
          value="12"
          icon={Calendar}
          subtitle="Currently online"
        />
        <StatCard
          title="Pending Approvals"
          value="3"
          icon={ClipboardList}
          subtitle="User access requests"
        />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
              <Shield className="size-8 text-primary" />
            </div>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-2">System Overview</h2>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              All systems are operating normally. Use the Admin menu in the sidebar to manage users, review system logs, configure settings, and manage workflows.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Billing Dashboard ---
function BillingDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
          Good morning, Billing
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {"Here's your billing overview for February 10, 2026"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Claims"
          value="14"
          icon={FileText}
          subtitle="Awaiting submission"
        />
        <StatCard
          title="Approved Claims"
          value="47"
          change="+6 this week"
          changeType="positive"
          icon={ClipboardCheck}
          subtitle="This billing cycle"
        />
        <StatCard
          title="Denied Claims"
          value="3"
          icon={ClipboardX}
          subtitle="Requires follow-up"
        />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
              <FileText className="size-8 text-primary" />
            </div>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-2">Billing Center</h2>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Review patient insurance forms and billing documents from the Patients tab. Use the sidebar to access workflows and system tools.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Psychiatrist Dashboard (original full dashboard) ---
function PsychiatristDashboard({
  onNavigate,
}: {
  onNavigate?: (tab: string, options?: { filter?: string; patientId?: string }) => void
}) {
  const recentNotes = clinicalNotes.filter((n) => n.status === "draft")
  const highRiskPatients = patients.filter((p) => p.riskLevel === "high")
  const [selectedHighRisk, setSelectedHighRisk] = useState<Patient | null>(null)

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
          Good morning, Dr. Chen
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {"Here's an overview of your practice today, February 10, 2026"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Pending Notes"
          value={dashboardStats.pendingNotes}
          icon={FileText}
          onClick={() => onNavigate?.("Patients", { filter: "dr-completion" })}
        />
        <StatCard
          title="Total Patients"
          value={dashboardStats.totalPatients}
          change="+8 this month"
          changeType="positive"
          icon={FileText}
          subtitle="Active across all providers"
        />
      </div>

      {/* High Risk Patients */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            <CardTitle className="text-base font-heading font-semibold text-foreground">
              High Risk Patients
            </CardTitle>
          </div>
          <CardDescription>{highRiskPatients.length} patients require close monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {highRiskPatients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedHighRisk(patient)}
              >
                <Avatar className="size-9">
                  <AvatarFallback className="bg-destructive/10 text-destructive text-xs">
                    {patient.firstName[0]}
                    {patient.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{patient.primaryDiagnosis}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-muted-foreground">{patient.assignedProvider}</p>
                  <p className="text-xs text-muted-foreground">Last: {patient.lastVisit}</p>
                </div>
                <Badge variant="destructive" className="text-[10px] shrink-0">High</Badge>
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* High Risk Navigation Dialog */}
      <Dialog open={!!selectedHighRisk} onOpenChange={() => setSelectedHighRisk(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">
              {selectedHighRisk?.firstName} {selectedHighRisk?.lastName}
            </DialogTitle>
            <DialogDescription>
              Where would you like to navigate for this patient?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              variant="outline"
              className="justify-start gap-3 h-auto p-4 bg-transparent text-foreground hover:bg-muted/50"
              onClick={() => {
                if (selectedHighRisk) {
                  onNavigate?.("Patients", { patientId: selectedHighRisk.id })
                }
                setSelectedHighRisk(null)
              }}
            >
              <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 shrink-0">
                <FolderOpen className="size-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Documents & Forms</p>
                <p className="text-xs text-muted-foreground">View patient forms and documents</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-3 h-auto p-4 bg-transparent text-foreground hover:bg-muted/50"
              onClick={() => {
                if (selectedHighRisk) {
                  onNavigate?.("Treatment Plans", { patientId: selectedHighRisk.id })
                }
                setSelectedHighRisk(null)
              }}
            >
              <div className="flex items-center justify-center size-9 rounded-lg bg-accent/10 shrink-0">
                <ClipboardList className="size-4 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Treatment Plan</p>
                <p className="text-xs text-muted-foreground">View treatment goals and progress</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground ml-auto" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Charts + Unsigned Notes Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Diagnosis Distribution */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading font-semibold text-foreground">
              Diagnosis Mix
            </CardTitle>
            <CardDescription>Active patient distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diagnosisDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {diagnosisDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend
                    wrapperStyle={{ fontSize: "11px" }}
                    formatter={(value) => (
                      <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>
                    )}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Unsigned Notes */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-chart-4" />
              <CardTitle className="text-base font-heading font-semibold text-foreground">
                Unsigned Notes
              </CardTitle>
            </div>
            <CardDescription>{recentNotes.length} notes awaiting signature</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {recentNotes.map((note) => (
                <div key={note.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{note.patientName}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{note.summary}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{note.date}</p>
                    <Badge variant="secondary" className="bg-chart-4/10 text-chart-4 text-[10px] mt-1">Draft</Badge>
                  </div>
                </div>
              ))}
              {recentNotes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">All notes are signed.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- Main Export: Role-based Dashboard ---
export function DashboardView({
  onNavigate,
  userRole,
}: {
  onNavigate?: (tab: string, options?: { filter?: string; patientId?: string }) => void
  userRole?: UserRole
}) {
  switch (userRole) {
    case "technician":
      return <TechnicianDashboard onNavigate={onNavigate} />
    case "admin":
      return <AdminDashboard />
    case "psychiatrist":
    default:
      return <PsychiatristDashboard onNavigate={onNavigate} />
  }
}
