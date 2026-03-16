import * as React from "react"

import { NavDocuments } from "@/components/applayout/nav-documents"
import { NavMain } from "@/components/applayout/nav-main"
import { NavSecondary } from "@/components/applayout/nav-secondary"
import { NavUser } from "@/components/applayout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ListIcon, ChartBarIcon, FolderIcon, UsersIcon, CameraIcon, FileTextIcon, Settings2Icon, CircleHelpIcon, SearchIcon, DatabaseIcon, FileChartColumnIcon, FileIcon, CommandIcon, ShoppingBagIcon, ShoppingCartIcon } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const data = {
  user: {
    name: "Guest",
    email: "guest@example.com",
    avatar: "/avatars/guest.jpg",
  },
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <SearchIcon />
      ),
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: (
        <DatabaseIcon />
      ),
    },
    {
      name: "Reports",
      url: "#",
      icon: (
        <FileChartColumnIcon />
      ),
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const { user } = useAuth();
  const role = user?.role || "GUEST";

  // Build navMain dynamically based on role
  const navMainItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      roles: ["ADMIN", "RETAILER", "CUSTOMER"],
    },
    {
      title: "Shop",
      url: "/shop",
      icon: <ShoppingBagIcon />,
      roles: ["RETAILER", "CUSTOMER"],
    },
    {
      title: "Products",
      url: "/products",
      icon: <ListIcon />,
      roles: ["ADMIN", "RETAILER"],
    },
    {
      title: "Add Product",
      url: "/products/add",
      icon: <FolderIcon />,
      roles: ["ADMIN", "RETAILER"],
    },
    {
      title: "Cart",
      url: "/shop/cart",
      icon: <ShoppingCartIcon />,
      roles: ["CUSTOMER", "RETAILER"],
    },
    {
      title: "Inventory",
      url: role === "ADMIN" ? "/inventory/admin" : "/inventory/retailer",
      icon: <DatabaseIcon />,
      roles: ["ADMIN", "RETAILER"],
    },
    {
      title: role === "ADMIN" ? "Orders" : "My Orders",
      url: role === "ADMIN" ? "/orders/my/admin" : "/orders/my/retailer",
      icon: <FileTextIcon />,
      roles: ["ADMIN", "RETAILER"],
    }
  ].filter(item => item.roles.includes(role));

  const currentUserData = user ? {
    name: user.name,
    email: user.email,
    avatar: "/avatars/guest.jpg" // Placeholder
  } : data.user;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="/">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Inventory System</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navMainItems.length > 0 && <NavMain items={navMainItems} />}
        {role === "ADMIN" && <NavDocuments items={data.documents} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUserData} />
      </SidebarFooter>
    </Sidebar>
  );
}
