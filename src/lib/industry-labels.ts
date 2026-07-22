export type IndustryType = "construction" | "dealership" | "mechanic" | "rental" | "default";

export interface NavItemConfig {
  label: string;
  icon: string;
  href: string;
}

export const INDUSTRIES: { value: IndustryType; label: string }[] = [
  { value: "construction", label: "industries.construction" },
  { value: "dealership", label: "industries.dealership" },
  { value: "mechanic", label: "industries.mechanic" },
  { value: "rental", label: "industries.rental" },
  { value: "default", label: "industries.default" },
];

const INDUSTRY_NAV_ITEMS: Record<IndustryType, NavItemConfig[]> = {
  construction: [
    { label: "industryNav.construction.constructionSites", icon: "Building2", href: "/dashboard/construction-sites" },
    { label: "industryNav.construction.partsInventory", icon: "Package", href: "/dashboard/parts" },
    { label: "industryNav.construction.serviceProviders", icon: "Wrench", href: "/dashboard/service-providers" },
    { label: "industryNav.construction.drivers", icon: "Users", href: "/dashboard/drivers" },
  ],
  dealership: [
    { label: "industryNav.dealership.lotsShowroom", icon: "Building", href: "/dashboard/construction-sites" },
    { label: "industryNav.dealership.vehicleInventory", icon: "Car", href: "/dashboard/vehicles" },
    { label: "industryNav.dealership.serviceDept", icon: "Wrench", href: "/dashboard/service-providers" },
    { label: "industryNav.dealership.salesReps", icon: "Users", href: "/dashboard/drivers" },
  ],
  mechanic: [
    { label: "industryNav.mechanic.vehiclesInShop", icon: "Car", href: "/dashboard/vehicles" },
    { label: "industryNav.mechanic.partsInventory", icon: "Package", href: "/dashboard/parts" },
    { label: "industryNav.mechanic.suppliers", icon: "Truck", href: "/dashboard/service-providers" },
    { label: "industryNav.mechanic.technicians", icon: "Users", href: "/dashboard/drivers" },
  ],
  rental: [
    { label: "industryNav.rental.pickupLocations", icon: "MapPin", href: "/dashboard/construction-sites" },
    { label: "industryNav.rental.fleetInventory", icon: "Truck", href: "/dashboard/vehicles" },
    { label: "industryNav.rental.vendors", icon: "Briefcase", href: "/dashboard/service-providers" },
    { label: "industryNav.rental.staff", icon: "Users", href: "/dashboard/drivers" },
  ],
  default: [
    { label: "industryNav.default.locations", icon: "Building2", href: "/dashboard/construction-sites" },
    { label: "industryNav.default.inventory", icon: "Package", href: "/dashboard/parts" },
    { label: "industryNav.default.vendors", icon: "Briefcase", href: "/dashboard/service-providers" },
    { label: "industryNav.default.people", icon: "Users", href: "/dashboard/drivers" },
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
    "construction-sites": { heading: "industryPages.construction.constructionSites.heading", subtitle: "industryPages.construction.constructionSites.subtitle", action: "industryPages.construction.constructionSites.action", newHeading: "industryPages.construction.constructionSites.newHeading", saveAction: "industryPages.construction.constructionSites.saveAction" },
    parts: { heading: "industryPages.construction.parts.heading", subtitle: "industryPages.construction.parts.subtitle", action: "industryPages.construction.parts.action", newHeading: "industryPages.construction.parts.newHeading", saveAction: "industryPages.construction.parts.saveAction" },
    "service-providers": { heading: "industryPages.construction.serviceProviders.heading", subtitle: "industryPages.construction.serviceProviders.subtitle", action: "industryPages.construction.serviceProviders.action", newHeading: "industryPages.construction.serviceProviders.newHeading", saveAction: "industryPages.construction.serviceProviders.saveAction" },
    drivers: { heading: "industryPages.construction.drivers.heading", subtitle: "industryPages.construction.drivers.subtitle", action: "industryPages.construction.drivers.action", newHeading: "industryPages.construction.drivers.newHeading", saveAction: "industryPages.construction.drivers.saveAction" },
    vehicles: { heading: "industryPages.construction.vehicles.heading", subtitle: "industryPages.construction.vehicles.subtitle", action: "industryPages.construction.vehicles.action", newHeading: "industryPages.construction.vehicles.newHeading", saveAction: "industryPages.construction.vehicles.saveAction" },
    tasks: { heading: "industryPages.construction.tasks.heading", subtitle: "industryPages.construction.tasks.subtitle", action: "industryPages.construction.tasks.action", newHeading: "industryPages.construction.tasks.newHeading", saveAction: "industryPages.construction.tasks.saveAction" },
  },
  dealership: {
    "construction-sites": { heading: "industryPages.dealership.constructionSites.heading", subtitle: "industryPages.dealership.constructionSites.subtitle", action: "industryPages.dealership.constructionSites.action", newHeading: "industryPages.dealership.constructionSites.newHeading", saveAction: "industryPages.dealership.constructionSites.saveAction" },
    parts: { heading: "industryPages.dealership.parts.heading", subtitle: "industryPages.dealership.parts.subtitle", action: "industryPages.dealership.parts.action", newHeading: "industryPages.dealership.parts.newHeading", saveAction: "industryPages.dealership.parts.saveAction" },
    "service-providers": { heading: "industryPages.dealership.serviceProviders.heading", subtitle: "industryPages.dealership.serviceProviders.subtitle", action: "industryPages.dealership.serviceProviders.action", newHeading: "industryPages.dealership.serviceProviders.newHeading", saveAction: "industryPages.dealership.serviceProviders.saveAction" },
    drivers: { heading: "industryPages.dealership.drivers.heading", subtitle: "industryPages.dealership.drivers.subtitle", action: "industryPages.dealership.drivers.action", newHeading: "industryPages.dealership.drivers.newHeading", saveAction: "industryPages.dealership.drivers.saveAction" },
    vehicles: { heading: "industryPages.dealership.vehicles.heading", subtitle: "industryPages.dealership.vehicles.subtitle", action: "industryPages.dealership.vehicles.action", newHeading: "industryPages.dealership.vehicles.newHeading", saveAction: "industryPages.dealership.vehicles.saveAction" },
    tasks: { heading: "industryPages.dealership.tasks.heading", subtitle: "industryPages.dealership.tasks.subtitle", action: "industryPages.dealership.tasks.action", newHeading: "industryPages.dealership.tasks.newHeading", saveAction: "industryPages.dealership.tasks.saveAction" },
  },
  mechanic: {
    "construction-sites": { heading: "industryPages.mechanic.constructionSites.heading", subtitle: "industryPages.mechanic.constructionSites.subtitle", action: "industryPages.mechanic.constructionSites.action", newHeading: "industryPages.mechanic.constructionSites.newHeading", saveAction: "industryPages.mechanic.constructionSites.saveAction" },
    parts: { heading: "industryPages.mechanic.parts.heading", subtitle: "industryPages.mechanic.parts.subtitle", action: "industryPages.mechanic.parts.action", newHeading: "industryPages.mechanic.parts.newHeading", saveAction: "industryPages.mechanic.parts.saveAction" },
    "service-providers": { heading: "industryPages.mechanic.serviceProviders.heading", subtitle: "industryPages.mechanic.serviceProviders.subtitle", action: "industryPages.mechanic.serviceProviders.action", newHeading: "industryPages.mechanic.serviceProviders.newHeading", saveAction: "industryPages.mechanic.serviceProviders.saveAction" },
    drivers: { heading: "industryPages.mechanic.drivers.heading", subtitle: "industryPages.mechanic.drivers.subtitle", action: "industryPages.mechanic.drivers.action", newHeading: "industryPages.mechanic.drivers.newHeading", saveAction: "industryPages.mechanic.drivers.saveAction" },
    vehicles: { heading: "industryPages.mechanic.vehicles.heading", subtitle: "industryPages.mechanic.vehicles.subtitle", action: "industryPages.mechanic.vehicles.action", newHeading: "industryPages.mechanic.vehicles.newHeading", saveAction: "industryPages.mechanic.vehicles.saveAction" },
    tasks: { heading: "industryPages.mechanic.tasks.heading", subtitle: "industryPages.mechanic.tasks.subtitle", action: "industryPages.mechanic.tasks.action", newHeading: "industryPages.mechanic.tasks.newHeading", saveAction: "industryPages.mechanic.tasks.saveAction" },
  },
  rental: {
    "construction-sites": { heading: "industryPages.rental.constructionSites.heading", subtitle: "industryPages.rental.constructionSites.subtitle", action: "industryPages.rental.constructionSites.action", newHeading: "industryPages.rental.constructionSites.newHeading", saveAction: "industryPages.rental.constructionSites.saveAction" },
    parts: { heading: "industryPages.rental.parts.heading", subtitle: "industryPages.rental.parts.subtitle", action: "industryPages.rental.parts.action", newHeading: "industryPages.rental.parts.newHeading", saveAction: "industryPages.rental.parts.saveAction" },
    "service-providers": { heading: "industryPages.rental.serviceProviders.heading", subtitle: "industryPages.rental.serviceProviders.subtitle", action: "industryPages.rental.serviceProviders.action", newHeading: "industryPages.rental.serviceProviders.newHeading", saveAction: "industryPages.rental.serviceProviders.saveAction" },
    drivers: { heading: "industryPages.rental.drivers.heading", subtitle: "industryPages.rental.drivers.subtitle", action: "industryPages.rental.drivers.action", newHeading: "industryPages.rental.drivers.newHeading", saveAction: "industryPages.rental.drivers.saveAction" },
    vehicles: { heading: "industryPages.rental.vehicles.heading", subtitle: "industryPages.rental.vehicles.subtitle", action: "industryPages.rental.vehicles.action", newHeading: "industryPages.rental.vehicles.newHeading", saveAction: "industryPages.rental.vehicles.saveAction" },
    tasks: { heading: "industryPages.rental.tasks.heading", subtitle: "industryPages.rental.tasks.subtitle", action: "industryPages.rental.tasks.action", newHeading: "industryPages.rental.tasks.newHeading", saveAction: "industryPages.rental.tasks.saveAction" },
  },
  default: {
    "construction-sites": { heading: "industryPages.default.constructionSites.heading", subtitle: "industryPages.default.constructionSites.subtitle", action: "industryPages.default.constructionSites.action", newHeading: "industryPages.default.constructionSites.newHeading", saveAction: "industryPages.default.constructionSites.saveAction" },
    parts: { heading: "industryPages.default.parts.heading", subtitle: "industryPages.default.parts.subtitle", action: "industryPages.default.parts.action", newHeading: "industryPages.default.parts.newHeading", saveAction: "industryPages.default.parts.saveAction" },
    "service-providers": { heading: "industryPages.default.serviceProviders.heading", subtitle: "industryPages.default.serviceProviders.subtitle", action: "industryPages.default.serviceProviders.action", newHeading: "industryPages.default.serviceProviders.newHeading", saveAction: "industryPages.default.serviceProviders.saveAction" },
    drivers: { heading: "industryPages.default.drivers.heading", subtitle: "industryPages.default.drivers.subtitle", action: "industryPages.default.drivers.action", newHeading: "industryPages.default.drivers.newHeading", saveAction: "industryPages.default.drivers.saveAction" },
    vehicles: { heading: "industryPages.default.vehicles.heading", subtitle: "industryPages.default.vehicles.subtitle", action: "industryPages.default.vehicles.action", newHeading: "industryPages.default.vehicles.newHeading", saveAction: "industryPages.default.vehicles.saveAction" },
    tasks: { heading: "industryPages.default.tasks.heading", subtitle: "industryPages.default.tasks.subtitle", action: "industryPages.default.tasks.action", newHeading: "industryPages.default.tasks.newHeading", saveAction: "industryPages.default.tasks.saveAction" },
  },
};

const DEFAULT_PAGE_LABELS: Record<PageModule, PageLabels> = {
  "construction-sites": { heading: "industryPages.default.constructionSites.heading", subtitle: "industryPages.default.constructionSites.subtitle", action: "industryPages.default.constructionSites.action", newHeading: "industryPages.default.constructionSites.newHeading", saveAction: "industryPages.default.constructionSites.saveAction" },
  parts: { heading: "industryPages.default.parts.heading", subtitle: "industryPages.default.parts.subtitle", action: "industryPages.default.parts.action", newHeading: "industryPages.default.parts.newHeading", saveAction: "industryPages.default.parts.saveAction" },
  "service-providers": { heading: "industryPages.default.serviceProviders.heading", subtitle: "industryPages.default.serviceProviders.subtitle", action: "industryPages.default.serviceProviders.action", newHeading: "industryPages.default.serviceProviders.newHeading", saveAction: "industryPages.default.serviceProviders.saveAction" },
  drivers: { heading: "industryPages.default.drivers.heading", subtitle: "industryPages.default.drivers.subtitle", action: "industryPages.default.drivers.action", newHeading: "industryPages.default.drivers.newHeading", saveAction: "industryPages.default.drivers.saveAction" },
  vehicles: { heading: "industryPages.default.vehicles.heading", subtitle: "industryPages.default.vehicles.subtitle", action: "industryPages.default.vehicles.action", newHeading: "industryPages.default.vehicles.newHeading", saveAction: "industryPages.default.vehicles.saveAction" },
  tasks: { heading: "industryPages.default.tasks.heading", subtitle: "industryPages.default.tasks.subtitle", action: "industryPages.default.tasks.action", newHeading: "industryPages.default.tasks.newHeading", saveAction: "industryPages.default.tasks.saveAction" },
};

export function getIndustryPageLabels(industry: IndustryType, module: PageModule): PageLabels {
  return INDUSTRY_PAGE_LABELS[industry]?.[module] ?? DEFAULT_PAGE_LABELS[module];
}
