export type IndustryType = "construction" | "dealership" | "mechanic" | "rental" | "default";

export interface NavItemConfig {
  label: string;
  icon: string;
  href: string;
}

export const INDUSTRIES: { value: IndustryType; label: string }[] = [
  { value: "construction", label: "Construction / Fleet Operations" },
  { value: "dealership", label: "Dealership" },
  { value: "mechanic", label: "Independent Mechanic / Repair Shop" },
  { value: "rental", label: "Rental Company" },
  { value: "default", label: "Other / General Fleet" },
];

const INDUSTRY_NAV_ITEMS: Record<IndustryType, NavItemConfig[]> = {
  construction: [
    { label: "Construction Sites", icon: "Building2", href: "/dashboard/construction-sites" },
    { label: "Parts Inventory", icon: "Package", href: "/dashboard/parts" },
    { label: "Service Providers", icon: "Wrench", href: "/dashboard/service-providers" },
    { label: "Drivers", icon: "Users", href: "/dashboard/drivers" },
  ],
  dealership: [
    { label: "Lots & Showroom", icon: "Building", href: "/dashboard/construction-sites" },
    { label: "Vehicle Inventory", icon: "Car", href: "/dashboard/vehicles" },
    { label: "Service Dept", icon: "Wrench", href: "/dashboard/service-providers" },
    { label: "Sales Reps", icon: "Users", href: "/dashboard/drivers" },
  ],
  mechanic: [
    { label: "Vehicles in Shop", icon: "Car", href: "/dashboard/vehicles" },
    { label: "Parts Inventory", icon: "Package", href: "/dashboard/parts" },
    { label: "Suppliers", icon: "Truck", href: "/dashboard/service-providers" },
    { label: "Technicians", icon: "Users", href: "/dashboard/drivers" },
  ],
  rental: [
    { label: "Pickup Locations", icon: "MapPin", href: "/dashboard/construction-sites" },
    { label: "Fleet Inventory", icon: "Truck", href: "/dashboard/vehicles" },
    { label: "Vendors", icon: "Briefcase", href: "/dashboard/service-providers" },
    { label: "Staff", icon: "Users", href: "/dashboard/drivers" },
  ],
  default: [
    { label: "Locations", icon: "Building2", href: "/dashboard/construction-sites" },
    { label: "Inventory", icon: "Package", href: "/dashboard/parts" },
    { label: "Vendors", icon: "Briefcase", href: "/dashboard/service-providers" },
    { label: "People", icon: "Users", href: "/dashboard/drivers" },
  ],
};

export function getIndustryNavItems(industry: IndustryType): NavItemConfig[] {
  return INDUSTRY_NAV_ITEMS[industry] ?? INDUSTRY_NAV_ITEMS.default;
}

export type PageModule = "construction-sites" | "parts" | "service-providers" | "drivers" | "vehicles" | "tasks";

export interface PageLabels {
  heading: string;
  subtitle: string;
  action: string;
  newHeading: string;
  saveAction: string;
}

const INDUSTRY_PAGE_LABELS: Record<string, Partial<Record<PageModule, PageLabels>>> = {
  construction: {
    "construction-sites": { heading: "Construction Sites", subtitle: "Manage your construction sites and equipment", action: "New Site", newHeading: "New Construction Site", saveAction: "Create Site" },
    parts: { heading: "Parts Inventory", subtitle: "Track and manage your parts inventory", action: "Add Part", newHeading: "New Part", saveAction: "Add Part" },
    "service-providers": { heading: "Service Providers", subtitle: "Manage your service providers and vendors", action: "Add Provider", newHeading: "New Service Provider", saveAction: "Add Provider" },
    drivers: { heading: "Drivers", subtitle: "Manage your drivers and operators", action: "Add Driver", newHeading: "New Driver", saveAction: "Add Driver" },
    vehicles: { heading: "Vehicles", subtitle: "Manage your vehicles and equipment", action: "Add Vehicle", newHeading: "Add Vehicle", saveAction: "Add Vehicle" },
    tasks: { heading: "Equipment Tasks", subtitle: "Prioritized repairs and upgrades", action: "Add Task", newHeading: "Add Task", saveAction: "Add Task" },
  },
  dealership: {
    "construction-sites": { heading: "Lots & Showroom", subtitle: "Manage your lots and showroom inventory", action: "New Lot", newHeading: "New Lot", saveAction: "Create Lot" },
    parts: { heading: "Vehicle Inventory", subtitle: "Track your vehicle inventory", action: "Add Vehicle", newHeading: "Add Vehicle", saveAction: "Add Vehicle" },
    "service-providers": { heading: "Service Dept", subtitle: "Manage your service department", action: "Add Provider", newHeading: "New Service Provider", saveAction: "Add Provider" },
    drivers: { heading: "Sales Reps", subtitle: "Manage your sales representatives", action: "Add Rep", newHeading: "New Sales Rep", saveAction: "Add Rep" },
    vehicles: { heading: "Inventory", subtitle: "Manage your vehicle inventory", action: "Add Vehicle", newHeading: "Add Vehicle", saveAction: "Add Vehicle" },
    tasks: { heading: "Lot Tasks", subtitle: "Service and prep work prioritized", action: "Add Task", newHeading: "Add Task", saveAction: "Add Task" },
  },
  mechanic: {
    "construction-sites": { heading: "Locations", subtitle: "Manage your shop locations", action: "New Location", newHeading: "New Location", saveAction: "Create Location" },
    parts: { heading: "Parts Inventory", subtitle: "Track your parts and supplies", action: "Add Part", newHeading: "New Part", saveAction: "Add Part" },
    "service-providers": { heading: "Suppliers", subtitle: "Manage your parts suppliers and vendors", action: "Add Supplier", newHeading: "New Supplier", saveAction: "Add Supplier" },
    drivers: { heading: "Technicians", subtitle: "Manage your technicians and staff", action: "Add Technician", newHeading: "New Technician", saveAction: "Add Technician" },
    vehicles: { heading: "Vehicles in Shop", subtitle: "Track vehicles currently in the shop", action: "Add Vehicle", newHeading: "Add Vehicle", saveAction: "Add Vehicle" },
    tasks: { heading: "Work Orders", subtitle: "Repair jobs and upgrades prioritized", action: "New Work Order", newHeading: "New Work Order", saveAction: "Create Work Order" },
  },
  rental: {
    "construction-sites": { heading: "Pickup Locations", subtitle: "Manage your rental pickup locations", action: "New Location", newHeading: "New Pickup Location", saveAction: "Create Location" },
    parts: { heading: "Fleet Inventory", subtitle: "Track your rental fleet inventory", action: "Add Item", newHeading: "New Item", saveAction: "Add Item" },
    "service-providers": { heading: "Vendors", subtitle: "Manage your vendors and partners", action: "Add Vendor", newHeading: "New Vendor", saveAction: "Add Vendor" },
    drivers: { heading: "Staff", subtitle: "Manage your staff and operators", action: "Add Staff", newHeading: "New Staff", saveAction: "Add Staff" },
    vehicles: { heading: "Fleet", subtitle: "Manage your rental fleet", action: "Add to Fleet", newHeading: "Add to Fleet", saveAction: "Add to Fleet" },
    tasks: { heading: "Fleet Tasks", subtitle: "Maintenance and prep prioritized", action: "Add Task", newHeading: "Add Task", saveAction: "Add Task" },
  },
  default: {
    "construction-sites": { heading: "Locations", subtitle: "Manage your locations", action: "New Location", newHeading: "New Location", saveAction: "Create Location" },
    parts: { heading: "Inventory", subtitle: "Track your inventory", action: "Add Item", newHeading: "New Item", saveAction: "Add Item" },
    "service-providers": { heading: "Vendors", subtitle: "Manage your vendors", action: "Add Vendor", newHeading: "New Vendor", saveAction: "Add Vendor" },
    drivers: { heading: "People", subtitle: "Manage your team", action: "Add Person", newHeading: "New Person", saveAction: "Add Person" },
    vehicles: { heading: "Fleet", subtitle: "Manage your fleet", action: "Add Vehicle", newHeading: "Add Vehicle", saveAction: "Add Vehicle" },
    tasks: { heading: "Vehicle Tasks", subtitle: "Repairs and upgrades prioritized", action: "Add Task", newHeading: "Add Task", saveAction: "Add Task" },
  },
};

const DEFAULT_PAGE_LABELS: Record<PageModule, PageLabels> = {
  "construction-sites": { heading: "Locations", subtitle: "Manage your locations", action: "New Location", newHeading: "New Location", saveAction: "Create Location" },
  parts: { heading: "Inventory", subtitle: "Track your inventory", action: "Add Item", newHeading: "New Item", saveAction: "Add Item" },
  "service-providers": { heading: "Vendors", subtitle: "Manage your vendors", action: "Add Vendor", newHeading: "New Vendor", saveAction: "Add Vendor" },
  drivers: { heading: "People", subtitle: "Manage your team", action: "Add Person", newHeading: "New Person", saveAction: "Add Person" },
  vehicles: { heading: "Fleet", subtitle: "Manage your fleet", action: "Add Vehicle", newHeading: "Add Vehicle", saveAction: "Add Vehicle" },
  tasks: { heading: "Vehicle Tasks", subtitle: "Repairs and upgrades prioritized", action: "Add Task", newHeading: "Add Task", saveAction: "Add Task" },
};

export function getIndustryPageLabels(industry: IndustryType, module: PageModule): PageLabels {
  return INDUSTRY_PAGE_LABELS[industry]?.[module] ?? DEFAULT_PAGE_LABELS[module];
}
