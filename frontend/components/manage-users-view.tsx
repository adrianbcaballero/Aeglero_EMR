"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  UserCog,
  Shield,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Mail,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SystemUser {
  id: string
  name: string
  email: string
  role: "admin" | "psychiatrist" | "therapist" | "counselor" | "intern" | "billing"
  status: "active" | "inactive" | "pending"
  lastLogin: string
  department: string
}

const systemUsers: SystemUser[] = [
  {
    id: "USR-001",
    name: "Dr. Emily Chen",
    email: "e.chen@aeglero.com",
    role: "psychiatrist",
    status: "active",
    lastLogin: "2026-02-10 08:45",
    department: "Clinical",
  },
  {
    id: "USR-002",
    name: "Dr. Michael Torres",
    email: "m.torres@aeglero.com",
    role: "therapist",
    status: "active",
    lastLogin: "2026-02-10 08:52",
    department: "Clinical",
  },
  {
    id: "USR-003",
    name: "Dr. Lisa Hoffman",
    email: "l.hoffman@aeglero.com",
    role: "psychiatrist",
    status: "active",
    lastLogin: "2026-02-10 09:31",
    department: "Clinical",
  },
  {
    id: "USR-004",
    name: "Sarah Williams",
    email: "s.williams@aeglero.com",
    role: "admin",
    status: "active",
    lastLogin: "2026-02-10 07:30",
    department: "Administration",
  },
  {
    id: "USR-005",
    name: "J. Rivera",
    email: "j.rivera@aeglero.com",
    role: "counselor",
    status: "active",
    lastLogin: "2026-02-09 16:20",
    department: "Clinical",
  },
  {
    id: "USR-006",
    name: "Karen Phillips",
    email: "k.phillips@aeglero.com",
    role: "billing",
    status: "active",
    lastLogin: "2026-02-10 09:22",
    department: "Billing",
  },
  {
    id: "USR-007",
    name: "Alex Nguyen",
    email: "a.nguyen@aeglero.com",
    role: "intern",
    status: "active",
    lastLogin: "2026-02-09 14:10",
    department: "Clinical",
  },
  {
    id: "USR-008",
    name: "Dr. Patricia Moore",
    email: "p.moore@aeglero.com",
    role: "therapist",
    status: "inactive",
    lastLogin: "2026-01-15 10:00",
    department: "Clinical",
  },
  {
    id: "USR-009",
    name: "Derek Simmons",
    email: "d.simmons@aeglero.com",
    role: "counselor",
    status: "pending",
    lastLogin: "",
    department: "Clinical",
  },
]

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  psychiatrist: "bg-primary/10 text-primary",
  therapist: "bg-accent/10 text-accent",
  counselor: "bg-chart-4/10 text-chart-4",
  intern: "bg-muted text-muted-foreground",
  billing: "bg-primary/10 text-primary",
}

const statusColors: Record<string, string> = {
  active: "bg-accent/10 text-accent",
  inactive: "bg-muted text-muted-foreground",
  pending: "bg-chart-4/10 text-chart-4",
}

export function ManageUsersView() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = systemUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeCount = systemUsers.filter((u) => u.status === "active").length
  const totalRoles = new Set(systemUsers.map((u) => u.role)).size

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">Manage Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            System users, roles, and access management
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 size-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <UserCog className="size-3.5 text-foreground" />
              <p className="text-xs text-muted-foreground font-medium">Total Users</p>
            </div>
            <p className="text-xl font-bold font-heading text-foreground">{systemUsers.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="size-3.5 text-accent" />
              <p className="text-xs text-muted-foreground font-medium">Active</p>
            </div>
            <p className="text-xl font-bold font-heading text-accent">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="size-3.5 text-chart-4" />
              <p className="text-xs text-muted-foreground font-medium">Pending</p>
            </div>
            <p className="text-xl font-bold font-heading text-chart-4">
              {systemUsers.filter((u) => u.status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="size-3.5 text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Roles</p>
            </div>
            <p className="text-xl font-bold font-heading text-primary">{totalRoles}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or role..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading font-semibold text-foreground">
            All Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground">User</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">Role</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">Department</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden md:table-cell">Last Login</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="size-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className={`text-[10px] capitalize ${roleColors[user.role]}`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{user.department}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] capitalize ${statusColors[user.status]}`}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">{user.lastLogin || "Never"}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
