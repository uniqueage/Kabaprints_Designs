/**
 * Registry of every editable content collection.
 *
 * The admin dashboard renders one screen per entry (`/admin/content/<slug>`)
 * and the server actions in `./actions.ts` use the same definitions to read the
 * submitted form fields, so adding a new editable section is a matter of adding
 * one object here — no new pages, forms or actions.
 *
 * `table` values are database table names and are never taken from the client:
 * the actions always resolve the collection from this list first.
 */

export type FieldType = "text" | "textarea" | "number" | "image" | "lines" | "select" | "color";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  rows?: number;
  min?: number;
  max?: number;
  /** For `select` fields: pull the options from another table. */
  optionsFrom?: "services";
  /** Which column of the source table to use as the option value / label. */
  optionsValue?: string;
  optionsLabel?: string;
}

export type IconKey = "package" | "box" | "file" | "eye" | "users" | "bag" | "edit" | "settings";

export interface CollectionDef {
  /** URL segment and registry key. */
  slug: string;
  /** Database table the collector writes to. */
  table: string;
  /** Plural label, e.g. "Portfolio works". */
  label: string;
  /** Singular label used in confirmation messages, e.g. "portfolio work". */
  singular: string;
  description: string;
  icon: IconKey;
  /** Field shown as the item's title in the list. */
  titleField: string;
  /** Optional field shown underneath the title. */
  subtitleField?: string;
  /** Fields that hold images (used for thumbnails and cleanup). */
  imageFields?: string[];
  /** Optional field holding a hex colour (used for the colour swatch). */
  colorField?: string;
  fields: FieldDef[];
  /** Extra note shown under the page heading. */
  note?: string;
}

const ORDINAL: FieldDef = {
  name: "ordinal",
  label: "Display order",
  type: "number",
  help: "Lower numbers appear first on the site.",
};

export const COLLECTIONS: CollectionDef[] = [
  {
    slug: "services",
    table: "services",
    label: "Services (categories)",
    singular: "service",
    description:
      "The service tags that power the home page, the services menu, the portfolio filters and each service page.",
    icon: "package",
    titleField: "tag",
    subtitleField: "tagline",
    imageFields: ["card_image", "hero_image"],
    note: "Deleting a service also deletes the products inside it.",
    fields: [
      {
        name: "slug",
        label: "URL slug",
        type: "text",
        required: true,
        placeholder: "transfer-print",
        help: "Lowercase words separated by dashes. Changing this changes the service page URL.",
      },
      { name: "tag", label: "Category name", type: "text", required: true, placeholder: "Transfer Print" },
      { name: "tagline", label: "Tagline", type: "text", required: true, placeholder: "Vivid, durable heat-transfer prints…" },
      { name: "description", label: "Full description", type: "textarea", required: true, rows: 5 },
      { name: "card_image", label: "Card image", type: "image", required: true, help: "Shown on the home page and services list." },
      { name: "hero_image", label: "Hero image", type: "image", required: true, help: "Background of the service page banner." },
      ORDINAL,
    ],
  },
  {
    slug: "hero",
    table: "hero_slides",
    label: "Hero carousel",
    singular: "hero slide",
    description: "The rotating slides at the top of the home page.",
    icon: "box",
    titleField: "title",
    subtitleField: "eyebrow",
    imageFields: ["image"],
    fields: [
      { name: "eyebrow", label: "Eyebrow (small label)", type: "text", required: true, placeholder: "Transfer Print" },
      { name: "title", label: "Headline", type: "text", required: true },
      { name: "blurb", label: "Body text", type: "textarea", required: true, rows: 3 },
      {
        name: "meta",
        label: "Chips",
        type: "lines",
        help: "One short phrase per line, e.g. “DTF & HTV”.",
      },
      { name: "image", label: "Background image", type: "image", required: true },
      { name: "href", label: "Link", type: "text", required: true, placeholder: "/services/transfer-print" },
      { name: "cta", label: "Button label", type: "text", required: true, placeholder: "See transfer prints" },
      ORDINAL,
    ],
  },
  {
    slug: "testimonials",
    table: "testimonials",
    label: "Testimonials",
    singular: "testimonial",
    description: "Client quotes shown in the testimonials carousel on the home page.",
    icon: "users",
    titleField: "name",
    subtitleField: "role",
    fields: [
      { name: "quote", label: "Quote", type: "textarea", required: true, rows: 4 },
      { name: "name", label: "Client name", type: "text", required: true },
      { name: "role", label: "Role / location", type: "text", required: true, placeholder: "Event Planner, Lagos" },
      { name: "initials", label: "Initials (avatar)", type: "text", required: true, placeholder: "CO" },
      { name: "rating", label: "Rating (1–5)", type: "number", min: 1, max: 5 },
      ORDINAL,
    ],
  },
  {
    slug: "portfolio",
    table: "portfolio_works",
    label: "Portfolio",
    singular: "portfolio piece",
    description: "The works gallery on the portfolio page.",
    icon: "eye",
    titleField: "title",
    subtitleField: "note",
    imageFields: ["image"],
    fields: [
      { name: "title", label: "Project title", type: "text", required: true },
      {
        name: "category_slug",
        label: "Category",
        type: "select",
        required: true,
        optionsFrom: "services",
        optionsValue: "slug",
        optionsLabel: "tag",
        help: "Which service this piece belongs to.",
      },
      { name: "image", label: "Image", type: "image", required: true },
      { name: "note", label: "Caption", type: "text", required: true, placeholder: "300 DTF transfers, 3-day delivery" },
      ORDINAL,
    ],
  },
  {
    slug: "before-after",
    table: "before_after",
    label: "Before & after",
    singular: "before/after pair",
    description: "The drag-to-reveal comparisons on the home page and portfolio page.",
    icon: "eye",
    titleField: "title",
    subtitleField: "note",
    imageFields: ["before", "after"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "service_slug",
        label: "Service",
        type: "select",
        required: true,
        optionsFrom: "services",
        optionsValue: "slug",
        optionsLabel: "tag",
        help: "Sets the badge shown on the comparison.",
      },
      {
        name: "href",
        label: "Link",
        type: "text",
        help: "Where the badge links to. Leave blank to link to the chosen service page.",
        placeholder: "/services/transfer-print",
      },
      { name: "before", label: "Before image", type: "image", required: true },
      { name: "after", label: "After image", type: "image", required: true },
      { name: "note", label: "Caption", type: "textarea", required: true, rows: 3 },
      ORDINAL,
    ],
  },
  {
    slug: "materials",
    table: "printable_materials",
    label: "Printable materials",
    singular: "material",
    description: "The “materials we print on” cards on the quote page.",
    icon: "file",
    titleField: "name",
    subtitleField: "detail",
    fields: [
      { name: "name", label: "Material group", type: "text", required: true, placeholder: "Fabric & Apparel" },
      { name: "detail", label: "Details", type: "textarea", required: true, rows: 2 },
      ORDINAL,
    ],
  },
  {
    slug: "sizes",
    table: "print_sizes",
    label: "Print sizes",
    singular: "size",
    description: "The standard sizes listed on the quote page, grouped by category.",
    icon: "file",
    titleField: "size",
    subtitleField: "group_name",
    fields: [
      { name: "group_name", label: "Group", type: "text", required: true, placeholder: "Stationery", help: "Sizes are listed together under this group." },
      { name: "size", label: "Size", type: "text", required: true, placeholder: "Flyer A6 / A5 / A4" },
      ORDINAL,
    ],
  },
  {
    slug: "colors",
    table: "print_colors",
    label: "Print colours",
    singular: "colour",
    description: "The colour swatches on the quote page.",
    icon: "edit",
    titleField: "name",
    subtitleField: "hex",
    colorField: "hex",
    fields: [
      { name: "name", label: "Colour name", type: "text", required: true, placeholder: "Kabaprints Blue" },
      { name: "hex", label: "Hex value", type: "color", required: true, placeholder: "#1E6FA9" },
      ORDINAL,
    ],
  },
  {
    slug: "color-notes",
    table: "color_notes",
    label: "Colour notes",
    singular: "colour note",
    description: "Extra notes shown under the colour swatches on the quote page.",
    icon: "file",
    titleField: "note",
    fields: [{ name: "note", label: "Note", type: "textarea", required: true, rows: 2 }, ORDINAL],
  },
  {
    slug: "design-services",
    table: "design_services",
    label: "Design services",
    singular: "design service",
    description: "The “what we design” cards on the Need a Design? page.",
    icon: "edit",
    titleField: "title",
    subtitleField: "detail",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, placeholder: "Logo Design & Refresh" },
      { name: "detail", label: "Description", type: "textarea", required: true, rows: 3 },
      ORDINAL,
    ],
  },
  {
    slug: "design-process",
    table: "design_process",
    label: "Design process",
    singular: "process step",
    description: "The four numbered steps on the Need a Design? page.",
    icon: "bag",
    titleField: "title",
    subtitleField: "step",
    fields: [
      { name: "step", label: "Step number", type: "text", required: true, placeholder: "01" },
      { name: "title", label: "Step title", type: "text", required: true, placeholder: "Brief" },
      { name: "detail", label: "Step detail", type: "textarea", required: true, rows: 3 },
      ORDINAL,
    ],
  },
];

export function getCollection(slug: string): CollectionDef | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
