"use client"

import { useState } from "react"
import {
  Search,
  Shield,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  FileText,
  Database,
  LogIn,
  Download,
  ArrowLeft,
  Globe,
  Tag,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface SystemLog {
  id: string
  timestamp: string
  level: "info" | "warning" | "error" | "success"
  category: "auth" | "record" | "system" | "compliance" | "billing"
  user: string
  action: string
  details: string
  ipAddress: string
  metadata?: Record<string, string>
}

const systemLogs: SystemLog[] = [
  {
    id: "LOG-001",
    timestamp: "2026-02-10 08:45:12",
    level: "info",
    category: "auth",
    user: "Dr. Emily Chen",
    action: "User Login",
    details: "Successful login via SSO",
    ipAddress: "192.168.1.105",
    metadata: { method: "SSO/SAML", session: "SES-40192", browser: "Chrome 122" },
  },
  {
    id: "LOG-002",
    timestamp: "2026-02-10 08:47:33",
    level: "info",
    category: "record",
    user: "Dr. Emily Chen",
    action: "Record Access",
    details: "Viewed patient record PT-001 (Sarah Mitchell)",
    ipAddress: "192.168.1.105",
    metadata: { patientId: "PT-001", recordType: "Full Chart", accessDuration: "4m 12s" },
  },
  {
    id: "LOG-003",
    timestamp: "2026-02-10 08:52:01",
    level: "success",
    category: "record",
    user: "Dr. Michael Torres",
    action: "Note Signed",
    details: "Clinical note CN-004 signed for Marcus Johnson",
    ipAddress: "192.168.1.112",
    metadata: { noteId: "CN-004", patientId: "PT-008", noteType: "Progress Note" },
  },
  {
    id: "LOG-004",
    timestamp: "2026-02-10 09:01:18",
    level: "warning",
    category: "compliance",
    user: "System",
    action: "HIPAA Alert",
    details: "Unusual access pattern detected: 15 records accessed in 5 minutes by user PRV-002",
    ipAddress: "192.168.1.112",
    metadata: { userId: "PRV-002", recordCount: "15", timeFrame: "5 minutes", ruleTriggered: "ACCESS-FREQ-01" },
  },
  {
    id: "LOG-005",
    timestamp: "2026-02-10 09:15:44",
    level: "error",
    category: "system",
    user: "System",
    action: "Integration Error",
    details: "Failed to sync appointment data with external calendar service. Retry scheduled.",
    ipAddress: "10.0.0.1",
    metadata: { service: "Google Calendar Sync", errorCode: "TIMEOUT_408", retryIn: "5 minutes" },
  },
  {
    id: "LOG-006",
    timestamp: "2026-02-10 09:22:07",
    level: "info",
    category: "billing",
    user: "Admin Staff",
    action: "Claim Submitted",
    details: "Insurance claim submitted for PT-005 (Maria Santos) - Aetna, amount: $275.00",
    ipAddress: "192.168.1.120",
    metadata: { claimId: "CLM-8821", patientId: "PT-005", payer: "Aetna", amount: "$275.00" },
  },
  {
    id: "LOG-007",
    timestamp: "2026-02-10 09:30:55",
    level: "warning",
    category: "auth",
    user: "Dr. Lisa Hoffman",
    action: "Failed Login",
    details: "Authentication failed - incorrect password (attempt 2/5)",
    ipAddress: "192.168.1.130",
    metadata: { attempt: "2/5", lockoutThreshold: "5", method: "Password" },
  },
  {
    id: "LOG-008",
    timestamp: "2026-02-10 09:31:20",
    level: "info",
    category: "auth",
    user: "Dr. Lisa Hoffman",
    action: "User Login",
    details: "Successful login after password reset",
    ipAddress: "192.168.1.130",
    metadata: { method: "Password Reset", session: "SES-40215" },
  },
  {
    id: "LOG-009",
    timestamp: "2026-02-10 09:45:03",
    level: "success",
    category: "record",
    user: "Dr. Emily Chen",
    action: "Treatment Plan Updated",
    details: "Treatment plan TP-001 updated for Sarah Mitchell - new goals added",
    ipAddress: "192.168.1.105",
    metadata: { planId: "TP-001", patientId: "PT-001", goalsAdded: "2" },
  },
  {
    id: "LOG-010",
    timestamp: "2026-02-10 10:00:00",
    level: "info",
    category: "system",
    user: "System",
    action: "Backup Completed",
    details: "Scheduled daily database backup completed successfully. Size: 2.4 GB.",
    ipAddress: "10.0.0.1",
    metadata: { backupSize: "2.4 GB", duration: "3m 42s", destination: "AWS S3" },
  },
  {
    id: "LOG-011",
    timestamp: "2026-02-10 10:12:38",
    level: "error",
    category: "billing",
    user: "System",
    action: "Claim Rejected",
    details: "Insurance claim for PT-002 rejected by Aetna - missing authorization code",
    ipAddress: "10.0.0.1",
    metadata: { claimId: "CLM-8804", patientId: "PT-002", rejectionCode: "AUTH-MISSING", payer: "Aetna" },
  },
  {
    id: "LOG-012",
    timestamp: "2026-02-10 10:25:14",
    level: "warning",
    category: "compliance",
    user: "System",
    action: "Consent Expiring",
    details: "Patient consent form for PT-007 (Elena Volkov) expires in 7 days",
    ipAddress: "10.0.0.1",
    metadata: { patientId: "PT-007", formId: "F-027", expiryDate: "2026-02-17" },
  },
  {
    id: "LOG-013",
    timestamp: "2026-02-10 10:40:22",
    level: "info",
    category: "record",
    user: "Dr. Michael Torres",
    action: "Record Export",
    details: "Patient records exported for PT-006 (Ryan O'Brien) - referral to specialist",
    ipAddress: "192.168.1.112",
    metadata: { patientId: "PT-006", exportFormat: "CDA/XML", recipient: "Dr. A. Kumar, Neuropsych" },
  },
  {
    id: "LOG-014",
    timestamp: "2026-02-10 11:05:09",
    level: "success",
    category: "system",
    user: "System",
    action: "Security Patch",
    details: "System security patch v3.2.1 applied successfully. No downtime required.",
    ipAddress: "10.0.0.1",
    metadata: { patchVersion: "v3.2.1", component: "Auth Module", downtime: "0s" },
  },
  {
    id: "LOG-015",
    timestamp: "2026-02-10 11:18:47",
    level: "info",
    category: "auth",
    user: "Admin Staff",
    action: "Permission Change",
    details: "Role updated for user 'J. Rivera' from Intern to Licensed Counselor",
    ipAddress: "192.168.1.120",
    metadata: { targetUser: "J. Rivera", oldRole: "Intern", newRole: "Licensed Counselor" },
  },
  {
    id: "LOG-016",
    timestamp: "2026-02-10 11:30:00",
    level: "error",
    category: "system",
    user: "System",
    action: "Service Degradation",
    details: "E-prescribing module response time exceeded 5s threshold. Monitoring escalated.",
    ipAddress: "10.0.0.1",
    metadata: { module: "E-Prescribing", responseTime: "7.2s", threshold: "5s", escalation: "Ops Team" },
  },
]

const levelConfig = {
  info: {
    icon: Info,
    color: "text-primary",
    bg: "bg-primary/10",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    badgeClass: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  },
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
  },
  success: {
    icon: CheckCircle,
    color: "text-accent",
    bg: "bg-accent/10",
    badgeClass: "bg-accent/10 text-accent border-accent/20",
  },
}

const categoryIcons = {
  auth: LogIn,
  record: FileText,
  system: Database,
  compliance: Shield,
  billing: FileText,
}

// ------- Log Detail Page -------
function LogDetailPage({
  log,
  onBack,
}: {
  log: SystemLog
  onBack: () => void
}) {
  const config = levelConfig[log.level]
  const LevelIcon = config.icon
  const CategoryIcon = categoryIcons[log.category]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">System Logs / {log.id}</p>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
            {log.action}
          </h1>
        </div>
        <Badge variant="secondary" className={`text-xs ${config.badgeClass}`}>
          {log.level}
        </Badge>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading font-semibold text-foreground">
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Log ID</p>
              <p className="text-sm font-medium font-mono text-foreground mt-1">{log.id}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Timestamp</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="size-3.5 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">{log.timestamp}</p>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Level</p>
              <div className="flex items-center gap-1.5 mt-1">
                <LevelIcon className={`size-3.5 ${config.color}`} />
                <p className="text-sm font-medium text-foreground capitalize">{log.level}</p>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Category</p>
              <div className="flex items-center gap-1.5 mt-1">
                <CategoryIcon className="size-3.5 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground capitalize">{log.category}</p>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">User</p>
              <div className="flex items-center gap-1.5 mt-1">
                <User className="size-3.5 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">{log.user}</p>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">IP Address</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Globe className="size-3.5 text-muted-foreground" />
                <p className="text-sm font-medium font-mono text-foreground">{log.ipAddress}</p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground leading-relaxed">{log.details}</p>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground" />
              <CardTitle className="text-base font-heading font-semibold text-foreground">
                Metadata
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(log.metadata).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="text-sm font-medium font-mono text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ------- Main System Logs View -------
export function SystemLogsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null)

  if (selectedLog) {
    return (
      <LogDetailPage
        log={selectedLog}
        onBack={() => setSelectedLog(null)}
      />
    )
  }

  const filteredLogs = systemLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = levelFilter === "all" || log.level === levelFilter
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter
    return matchesSearch && matchesLevel && matchesCategory
  })

  const logCounts = {
    total: systemLogs.length,
    errors: systemLogs.filter((l) => l.level === "error").length,
    warnings: systemLogs.filter((l) => l.level === "warning").length,
    info: systemLogs.filter((l) => l.level === "info" || l.level === "success").length,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
            System Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Audit trail, security events, and system activity
          </p>
        </div>
        <Button variant="outline" className="border-border text-foreground bg-transparent">
          <Download className="mr-2 size-4" />
          Export Logs
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="size-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-medium">Total Events</p>
            </div>
            <p className="text-xl font-bold font-heading text-foreground">{logCounts.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="size-3.5 text-destructive" />
              <p className="text-xs text-muted-foreground font-medium">Errors</p>
            </div>
            <p className="text-xl font-bold font-heading text-destructive">{logCounts.errors}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="size-3.5 text-chart-4" />
              <p className="text-xs text-muted-foreground font-medium">Warnings</p>
            </div>
            <p className="text-xl font-bold font-heading text-chart-4">{logCounts.warnings}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Info className="size-3.5 text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Info / Success</p>
            </div>
            <p className="text-xl font-bold font-heading text-primary">{logCounts.info}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by action, details, or user..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="record">Records</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries - clickable */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Activity Log ({filteredLogs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => {
              const config = levelConfig[log.level]
              const LevelIcon = config.icon
              const CategoryIcon = categoryIcons[log.category]

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 px-6 py-4 transition-colors hover:bg-muted/30 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedLog(log)}
                >
                  <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                    <LevelIcon className={`size-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{log.action}</span>
                      <Badge variant="secondary" className={`text-[10px] ${config.badgeClass}`}>
                        {log.level}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] capitalize text-muted-foreground border-border">
                        <CategoryIcon className="mr-1 size-2.5" />
                        {log.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed line-clamp-1">{log.details}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {log.user}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {log.timestamp}
                      </span>
                      <span className="hidden sm:inline">{log.ipAddress}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">No logs found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
