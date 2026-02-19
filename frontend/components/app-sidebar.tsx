"use client"

import type { UserRole } from "@/components/login-page"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ScrollText,
  Settings,
  HelpCircle,
  Brain,
  LogOut,
  ChevronDown,
  ShieldCheck,
  GitBranch,
  UserCog,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const allMainNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, roles: ["psychiatrist", "technician", "admin"] },
  { title: "Patients", icon: Users, roles: ["psychiatrist", "technician", "admin"] },
  { title: "Treatment Plans", icon: ClipboardList, roles: ["psychiatrist", "admin"] },
]

const adminNavItems = [
  { title: "Workflows", icon: GitBranch, roles: ["admin", "psychiatrist"] },
  { title: "Manage Users", icon: UserCog, roles: ["admin"] },
  { title: "System Logs", icon: ScrollText, roles: ["admin"] },
  { title: "Settings", icon: Settings, roles: ["admin"] },
]

const supportNavItems = [
  { title: "Help & Support", icon: HelpCircle },
  { title: "HIPAA Compliance Guidelines", icon: ShieldCheck },
]

const roleDisplayNames: Record<string, string> = {
  psychiatrist: "Psychiatrist",
  technician: "Technician",
  admin: "Administrator",
}

const roleUserNames: Record<string, { name: string; initials: string }> = {
  psychiatrist: { name: "Dr. Emily Chen", initials: "EC" },
  technician: { name: "Sarah Mitchell", initials: "SM" },
  admin: { name: "System Admin", initials: "SA" },
}

interface AppSidebarProps {
  activeItem: string
  onNavigate: (item: string) => void
  onSignOut: () => void
  userRole: UserRole
}

export function AppSidebar({ activeItem, onNavigate, onSignOut, userRole }: AppSidebarProps) {
  const mainNavItems = allMainNavItems.filter((item) => item.roles.includes(userRole))
  const filteredAdminItems = adminNavItems.filter((item) => item.roles.includes(userRole))
  const showAdmin = filteredAdminItems.length > 0
  const userInfo = roleUserNames[userRole] || { name: "User", initials: "U" }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-sidebar-accent"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Brain className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-sidebar-primary-foreground">Aeglero</span>
                <span className="text-xs text-sidebar-foreground/60">Mental Health EMR</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider font-semibold">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={activeItem === item.title}
                    onClick={() => onNavigate(item.title)}
                    tooltip={item.title}
                    className="transition-colors"
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider font-semibold">
                <ShieldCheck className="mr-1 size-3" />
                Admin
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredAdminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={activeItem === item.title}
                        onClick={() => onNavigate(item.title)}
                        tooltip={item.title}
                        className="transition-colors"
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-wider font-semibold">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={activeItem === item.title}
                    onClick={() => onNavigate(item.title)}
                    tooltip={item.title}
                    className="transition-colors"
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="hover:bg-sidebar-accent"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground rounded-lg text-xs">
                      {userInfo.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none text-left">
                    <span className="text-sm font-medium text-sidebar-primary-foreground">{userInfo.name}</span>
                    <span className="text-xs text-sidebar-foreground/60">{roleDisplayNames[userRole]}</span>
                  </div>
                  <ChevronDown className="ml-auto size-4 text-sidebar-foreground/50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-56"
              >
                <DropdownMenuItem className="text-destructive" onClick={onSignOut}>
                  <LogOut className="mr-2 size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
