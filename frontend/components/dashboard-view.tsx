"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  FolderOpen,
  ChevronRight,
  Users,
  Shield,
  Activity,
  Loader2,
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
import { getPatients, getAuditStats, getUsers } from "@/lib/api"
import type { Patient, AuditStats, SystemUser } from "@/lib/api"
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

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--chart-4))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
]

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  onClick,
  valueColor,
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  subtitle?: string
  onClick?: () => void
  valueColor?: string
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
            <p className={`text-2xl font-bold font-heading tracking-tight ${valueColor || "text-foreground"}`}>
              {value}
            </p>
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
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPatients()
      .then(setPatients)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const activeCount = patients.filter((p) => p.status === "active").length
  const highRiskCount = patients.filter((p) => p.riskLevel === "high").length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Active Patients"
          value={activeCount}
          icon={Users}
          subtitle="Currently in treatment"
        />
        <StatCard
          title="High Risk"
          value={highRiskCount}
          icon={AlertTriangle}
          subtitle="Require close monitoring"
          valueColor="text-destructive"
          onClick={() => onNavigate?.("Patients")}
        />
      </div>
    </div>
  )
}

// --- Admin Dashboard ---
function AdminDashboard() {
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAuditStats(), getUsers()])
      .then(([s, u]) => {
        setStats(s)
        setUsers(u)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const lockedCount = users.filter((u) => u.is_locked).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={Users}
          subtitle="All system accounts"
        />
        <StatCard
          title="Active Sessions"
          value={stats?.active_sessions ?? 0}
          icon={Activity}
          subtitle="Currently online"
          valueColor="text-accent"
        />
        <StatCard
          title="Logins Today"
          value={stats?.total_logins_today ?? 0}
          icon={Shield}
          subtitle="Successful authentications"
        />
        <StatCard
          title="Failed Logins"
          value={stats?.failed_logins_today ?? 0}
          icon={AlertTriangle}
          subtitle={lockedCount > 0 ? `${lockedCount} account(s) locked` : "No locked accounts"}
          valueColor={(stats?.failed_logins_today ?? 0) > 0 ? "text-destructive" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="size-3.5 text-destructive" />
              <p className="text-sm text-muted-foreground font-medium">401 Unauthenticated</p>
            </div>
            <p className="text-2xl font-bold font-heading text-foreground">
              {stats?.not_authenticated_today ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="size-3.5 text-destructive" />
              <p className="text-sm text-muted-foreground font-medium">403 Forbidden</p>
            </div>
            <p className="text-2xl font-bold font-heading text-foreground">
              {stats?.unauthorized_attempts_today ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="size-3.5 text-destructive" />
              <p className="text-sm text-muted-foreground font-medium">500 Server Errors</p>
            </div>
            <p className="text-2xl font-bold font-heading text-foreground">
              {stats?.server_errors_today ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
              <Shield className="size-8 text-primary" />
            </div>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-2">System Overview</h2>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Use the sidebar to manage users, review audit logs, and monitor system security. All access events are logged per HIPAA §164.312(b).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Psychiatrist Dashboard ---
function PsychiatristDashboard({
  onNavigate,
}: {
  onNavigate?: (tab: string, options?: { filter?: string; patientId?: string }) => void
}) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHighRisk, setSelectedHighRisk] = useState<Patient | null>(null)

  useEffect(() => {
    getPatients()
      .then(setPatients)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const highRiskPatients = patients.filter((p) => p.riskLevel === "high")
  const activeCount = patients.filter((p) => p.status === "active").length

  // Build diagnosis distribution from real data
  const diagnosisCounts: Record<string, number> = {}
  patients.forEach((p) => {
    const diag = p.primaryDiagnosis || "Unspecified"
    diagnosisCounts[diag] = (diagnosisCounts[diag] || 0) + 1
  })
  const diagnosisData = Object.entries(diagnosisCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], i) => ({
      name,
      value,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Patients"
          value={patients.length}
          icon={Users}
          subtitle={`${activeCount} active`}
        />
        <StatCard
          title="High Risk"
          value={highRiskPatients.length}
          icon={AlertTriangle}
          subtitle="Require close monitoring"
          valueColor="text-destructive"
        />
        <StatCard
          title="Diagnoses Tracked"
          value={Object.keys(diagnosisCounts).length}
          icon={ClipboardList}
          subtitle="Unique diagnoses"
        />
      </div>

      {/* High Risk Patients */}
      {highRiskPatients.length > 0 && (
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
                      {patient.firstName[0]}{patient.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {patient.primaryDiagnosis || "No diagnosis"}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-[10px] shrink-0">High</Badge>
                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                <p className="text-sm font-medium">Patient Record</p>
                <p className="text-xs text-muted-foreground">View forms and details</p>
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

      {/* Diagnosis Distribution Chart */}
      {diagnosisData.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading font-semibold text-foreground">
              Diagnosis Distribution
            </CardTitle>
            <CardDescription>Top {diagnosisData.length} diagnoses across active patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diagnosisData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {diagnosisData.map((entry, index) => (
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
                    formatter={(value: number) => [`${value} patients`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
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