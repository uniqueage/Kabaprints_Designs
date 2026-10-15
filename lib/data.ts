export const SITE = {
  name: "Kabaprints",
  tagline: "Printshop + Design",
  vision:
    "Kabaprints is a Marketing and Printing Agency that specialises in Advert production. We are dynamic and highly creative professionals. As a matter of policy, our primary motive is to see that our clients' communication campaigns lead to great profits",
  hours: "24/7",
  hoursDays: "Monday – Sunday",
  phones: [
    { display: "0803 296 1171", tel: "+2348032961171" },
    { display: "0915 281 2526", tel: "+2349152812526" },
  ],
  whatsappNumber: "2348032961171",
  whatsappDisplay: "0803 296 1171",
  email: "hello@kabaprints.com",
} as const;

export function whatsappLink(message = "Hello Kabaprints! I would like to request a quote for my print job.") {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export type ServiceItem = { title: string; blurb: string; image: string };

export type Service = {
  slug: string;
  tag: string;
  tagline: string;
  description: string;
  cardImage: string;
  heroImage: string;
  items: ServiceItem[];
  substrates: string[];
  techniques: string[];
  bestFor: string[];
};

export const services: Service[] = [
  {
    slug: "transfer-print",
    tag: "Transfer Print",
    tagline: "Vivid, durable heat-transfer prints for apparel and fabric accessories.",
    description:
      "Our transfer print service presses full-colour artwork onto fabric with DTF, HTV and sublimation technology. The result is a soft, stretchable print that survives hundreds of washes — ideal for small runs, custom pieces and photo-quality designs.",
    cardImage: "/images/svc-transfer.svg",
    heroImage: "/images/hero-transfer.svg",
    items: [
      { title: "Printed T-Shirts", blurb: "Photo-quality DTF and vinyl transfers on 100% cotton and poly-cotton blends — perfect for events, merch and team tees.", image: "/images/tshirt.svg" },
      { title: "Hoodies", blurb: "Puff, flock and silicone transfers that stay crisp and flexible wash after wash on fleece and French terry.", image: "/images/hoodie.svg" },
      { title: "Face Caps", blurb: "Crisp front, side and back transfers applied with curved platens so the print follows the cap perfectly.", image: "/images/cap.svg" },
      { title: "Throw Pillows", blurb: "Quotes, photos and patterns pressed onto cushion covers for homes, hotels, lounges and event décor.", image: "/images/pillow.svg" },
    ],
    substrates: ["100% cotton tees", "Poly-cotton blends", "Fleece & French terry", "Canvas and twill", "Satin & velvet pillow covers"],
    techniques: ["DTF transfer", "HTV vinyl (matte, glossy, transparent)", "Puff, flock & silicone", "Sublimation for polyester"],
    bestFor: ["Event merchandise", "Team uniforms", "Personalised gifting", "Fashion drops"],
  },
  {
    slug: "screen-print",
    tag: "Screen Print",
    tagline: "Bold, cost-effective ink printing made for bulk orders.",
    description:
      "Screen printing pushes premium plastisol or water-based ink through a fine mesh screen to produce rich, opaque colours that last. It is the most economical method for larger quantities and the industry standard for uniform and promo runs.",
    cardImage: "/images/svc-screen.svg",
    heroImage: "/images/hero-screen.svg",
    items: [
      { title: "Printed Nylons", blurb: "Durable logo prints on nylon bags — crisp, opaque ink that does not crack on flexible material.", image: "/images/nylon.svg" },
      { title: "Shopping Bags", blurb: "Branded canvas and tote bags that customers reuse again and again — walking adverts for your business.", image: "/images/shopping-bag.svg" },
      { title: "Uniforms", blurb: "Company, school and security uniforms with left-chest logos, back prints and reflective accents.", image: "/images/uniform.svg" },
      { title: "Bulk T-Shirts", blurb: "One to six colour prints at unbeatable per-piece pricing for rallies, launches and annual events.", image: "/images/bulk-shirts.svg" },
    ],
    substrates: ["Cotton & polycotton", "Nylon and PVC", "Canvas & jute", "Drill, denim & twill", "Non-woven fabric"],
    techniques: ["1–6 colour plastisol print", "Water-based soft-hand ink", "Halftone & gradient art", "Glow-in-the-dark ink"],
    bestFor: ["Bulk orders (50+ pieces)", "Corporate uniforms", "Campaign & rally tees", "Promo giveaways"],
  },
  {
    slug: "clean-banners",
    tag: "Clean Banners",
    tagline: "Crisp large-format and stationery printing that makes events shine.",
    description:
      "From handbills to stadium-size backdrops, we print sharp, colour-accurate graphics on presses calibrated for CMYK and Pantone. Every piece is checked for alignment, bleed and finish before it leaves the shop.",
    cardImage: "/images/svc-banners.svg",
    heroImage: "/images/hero-banners.svg",
    items: [
      { title: "Flyers", blurb: "Handbills and leaflets on glossy, matt or uncoated stock — 130gsm to 170gsm, folded or flat.", image: "/images/flyers.svg" },
      { title: "Sticker Printing", blurb: "Die-cut, circle and square stickers on paper, vinyl and transparent stock with strong permanent adhesive.", image: "/images/stickers.svg" },
      { title: "Wedding Cards", blurb: "Invitation suites on ivory, pearl and art card with foil, emboss and ribbon finishes.", image: "/images/wedding-cards.svg" },
      { title: "Roll-up Banners", blurb: "Portable 850mm and 1000mm pull-up banners with aluminium cassettes — set up in seconds.", image: "/images/rollup-banners.svg" },
      { title: "Posters", blurb: "A3 to A1 posters on glossy, silk and matt art paper for promotions, announcements and art prints.", image: "/images/posters.svg" },
      { title: "Backdrops", blurb: "Step-and-repeat and event backdrops printed on scrim or vinyl for photo zones, stages and expos.", image: "/images/backdrops.svg" },
    ],
    substrates: ["Art paper 130–300gsm", "Glossy & matt media", "Vinyl and canvas", "Foam board & PVC", "Ivory, pearl & cotton card"],
    techniques: ["Large-format digital", "Offset for big runs", "UV & latex printing", "Foil, emboss & die-cut"],
    bestFor: ["Weddings & parties", "Product launches", "Expos & conferences", "Retail promotions"],
  },
  {
    slug: "van-display",
    tag: "Van Display",
    tagline: "Turn every kilometre into an impression with professional vehicle branding.",
    description:
      "We design, print and install vehicle graphics using premium cast vinyl rated for Nigeria's sun and roads. Your bus, keke, van or car becomes a 24/7 billboard that reaches thousands of people every day.",
    cardImage: "/images/svc-van.svg",
    heroImage: "/images/hero-van.svg",
    items: [
      { title: "Vehicle Branding", blurb: "Full and partial wraps for vans, SUVs and trucks — contour-cut panels, squeegeed bubble-free.", image: "/images/vehicle-branding.svg" },
      { title: "Car Stickers", blurb: "Door decals, logo stickers, number-board lettering and rear-screen graphics in cut vinyl.", image: "/images/car-stickers.svg" },
      { title: "Bus Branding", blurb: "Side panels, window one-way-vision films and fleet numbers that keep your buses on-brand.", image: "/images/bus-branding.svg" },
      { title: "Keke Branding", blurb: "Affordable, high-impact branding for commercial tricycles — logo, colours and contact details.", image: "/images/keke-branding.svg" },
    ],
    substrates: ["Cast & calendered vinyl", "One-way vision film", "Reflective vinyl", "Magnetic sheets", "Cast laminate for UV protection"],
    techniques: ["Full vehicle wrap", "Partial wrap & panels", "Cut-letter branding", "Fleet consistency programs"],
    bestFor: ["Logistics fleets", "Ride-hailing cars", "Campaign vehicles", "Delivery vans"],
  },
  {
    slug: "engraving",
    tag: "Engraving",
    tagline: "Precision engraving for moments worth remembering.",
    description:
      "Our laser and rotary engravers etch names, logos and messages into wood, metal, acrylic and glass with micron-level accuracy. Personalised, permanent and premium — the gift that never fades.",
    cardImage: "/images/svc-engraving.svg",
    heroImage: "/images/svc-engraving.svg",
    items: [
      { title: "Picture Framing", blurb: "Framed photographs and art with an engraved name plate beneath — a personal gift for milestones.", image: "/images/picture-framing.svg" },
      { title: "Awards", blurb: "Crystal, glass and wooden trophies engraved with recipient names, categories and dates.", image: "/images/awards.svg" },
      { title: "Plaques", blurb: "Executive wood plaques with brushed-metal plates for retirements, donations and appreciation.", image: "/images/plaques.svg" },
      { title: "Name Tags", blurb: "Enamel-style name badges and lapel tags with magnetic or pin backs for staff and events.", image: "/images/name-tags.svg" },
    ],
    substrates: ["Wood & bamboo", "Acrylic (opaque and clear)", "Brass, aluminium & steel", "Glass & crystal", "Marble & stone"],
    techniques: ["Laser engraving", "Rotary engraving", "Sandblast etching", "Colour fill on engraved plates"],
    bestFor: ["Award nights", "Retirement gifts", "Wedding keepsakes", "Staff identification"],
  },
  {
    slug: "signage",
    tag: "Signage",
    tagline: "Everything your brand needs to be seen — on desks, doors and streets.",
    description:
      "We print the everyday brand essentials and fabricate the big, visible stuff: shop signs, illuminated light boxes and 3D letters that draw customers in from the road. Designed, produced and installed by one team.",
    cardImage: "/images/svc-signage.svg",
    heroImage: "/images/svc-signage.svg",
    items: [
      { title: "Business Cards", blurb: "Premium 350gsm cards with matt lamination, spot UV and rounded corners that get noticed.", image: "/images/business-cards.svg" },
      { title: "Jotters", blurb: "Branded spiral jotters and notebooks for conferences, schools and corporate giveaways.", image: "/images/jotters.svg" },
      { title: "Exercise Books", blurb: "Custom-covered exercise books for schools, churches and training programmes in any quantity.", image: "/images/exercise-books.svg" },
      { title: "Shop Signs", blurb: "Fronts, fascia and direction signs on ACP, acrylic and PVC with vivid long-life colour.", image: "/images/shop-signs.svg" },
      { title: "3D Letters", blurb: "Built-up acrylic and metal letters — halo-lit or front-lit — for lobby walls and shopfronts.", image: "/images/letters-3d.svg" },
      { title: "Light Boxes", blurb: "Illuminated LED light boxes that keep your brand glowing day and night.", image: "/images/light-boxes.svg" },
    ],
    substrates: ["Art card & business stock", "Acrylic & PVC foam", "ACP aluminium composite", "Stainless & brass", "LED panels & acrylic faces"],
    techniques: ["Digital & offset printing", "Spot UV and lamination", "CNC fabrication & installation", "LED illumination"],
    bestFor: ["Shop fronts", "Office branding", "Conferences", "Corporate stationery"],
  },
  {
    slug: "others",
    tag: "Others",
    tagline: "Custom branded merchandise and special requests, done right.",
    description:
      "If it can carry a logo, we can probably print it. This is where odd jobs, promotional products and one-off creative requests live — sourced, branded and delivered by the same team you already trust.",
    cardImage: "/images/svc-others.svg",
    heroImage: "/images/svc-others.svg",
    items: [
      { title: "Branded Mugs", blurb: "Ceramic and travel mugs sublimated with full-colour wraps for desks and gift packs.", image: "/images/branded-mugs.svg" },
      { title: "Branded Pens", blurb: "Metal and plastic pens laser-marked or pad-printed — the classic conference giveaway.", image: "/images/branded-pens.svg" },
      { title: "Branded Packaging", blurb: "Kraft bags, rigid boxes, hang tags and product labels that make unboxing feel premium.", image: "/images/packaging.svg" },
    ],
    substrates: ["Ceramic & metal drinkware", "Plastic & metal pens", "Kraft, art & rigid board", "Tote and organza bags"],
    techniques: ["Sublimation", "Pad printing", "Laser marking", "Custom die-cuts & labels"],
    bestFor: ["Promotional products", "Welcome packs", "Product packaging", "Special requests"],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);

export type HeroSlide = {
  image: string;
  eyebrow: string;
  title: string;
  blurb: string;
  meta: string[];
  href: string;
  cta: string;
};

export const heroSlides: HeroSlide[] = [
  {
    image: "/images/hero-transfer.svg",
    eyebrow: "Transfer Print",
    title: "Apparel prints that stay vivid, wash after wash",
    blurb: "Photo-quality DTF and vinyl transfers on t-shirts, hoodies, face caps and throw pillows — soft to the touch, bold to the eye.",
    meta: ["DTF & HTV", "Small runs welcome", "48-hour turnaround"],
    href: "/services/transfer-print",
    cta: "See transfer prints",
  },
  {
    image: "/images/hero-screen.svg",
    eyebrow: "Screen Print",
    title: "Bulk printing with unbeatable per-piece pricing",
    blurb: "Opaque plastisol ink on nylons, shopping bags, uniforms and bulk t-shirts — one to six colours, fifty pieces and above.",
    meta: ["1–6 colours", "Bulk discounts", "Durable ink"],
    href: "/services/screen-print",
    cta: "See screen printing",
  },
  {
    image: "/images/hero-banners.svg",
    eyebrow: "Clean Banners",
    title: "Flyers, cards, banners and backdrops that stop crowds",
    blurb: "Colour-accurate large-format printing for weddings, expos and promotions — checked for bleed, alignment and finish.",
    meta: ["A6 to A1", "Foil & emboss", "Custom sizes"],
    href: "/services/clean-banners",
    cta: "See banners & print",
  },
  {
    image: "/images/hero-van.svg",
    eyebrow: "Van Display",
    title: "Fleet branding that advertises while you drive",
    blurb: "Full wraps, decals and cut-letter branding for vans, buses, cars and keke — premium cast vinyl installed bubble-free.",
    meta: ["Full & partial wraps", "UV laminated", "Fleet packages"],
    href: "/services/van-display",
    cta: "See vehicle branding",
  },
  {
    image: "/images/hero-signage.svg",
    eyebrow: "Signage",
    title: "Shop signs, 3D letters and light boxes that get you found",
    blurb: "Designed, fabricated and installed by one team — plus the stationery your brand runs on every day.",
    meta: ["LED lit", "3D letters", "Installed for you"],
    href: "/services/signage",
    cta: "See signage",
  },
];

export type Testimonial = { quote: string; name: string; role: string; initials: string };

export const testimonials: Testimonial[] = [
  {
    quote:
      "The event shirts came out exactly as designed — soft, colourful and still fresh after many washes. Kabaprints handled 400 pieces for us in three days.",
    name: "Chinedu Okafor",
    role: "Event Planner, Lagos",
    initials: "CO",
  },
  {
    quote:
      "They branded our entire bus and keke fleet. Passengers ask us for our address every week — that is how good the work looks.",
    name: "Musa Ibrahim",
    role: "Logistics CEO, Abuja",
    initials: "MI",
  },
  {
    quote:
      "Our wedding cards and backdrop were the talk of the event. The foil finishing looked far more expensive than what we paid.",
    name: "Tolu & Kemi Adeyemi",
    role: "Wedding Clients",
    initials: "TK",
  },
  {
    quote:
      "From proofing to installation, the light box sign was completely hassle-free. The shop is now impossible to miss at night.",
    name: "Blessing Nwosu",
    role: "Boutique Owner, Enugu",
    initials: "BN",
  },
  {
    quote:
      "We ordered staff uniforms for the new season and every jersey was consistent in colour and print. Delivery was right on schedule.",
    name: "Coach Emeka Obi",
    role: "Sports Academy Director",
    initials: "EO",
  },
  {
    quote:
      "The engraved plaques for our award night looked premium and the names were perfectly spelt. Highly professional team.",
    name: "Halima Yusuf",
    role: "HR Manager, Kano",
    initials: "HY",
  },
];

export type Work = { title: string; category: string; image: string; note: string };

export const portfolioWorks: Work[] = [
  { title: "Corporate Event Tees", category: "transfer-print", image: "/images/tshirt.svg", note: "300 DTF transfers, 3-day delivery" },
  { title: "Hoodie Merch Drop", category: "transfer-print", image: "/images/hoodie.svg", note: "Puff print on fleece" },
  { title: "Face Cap Series", category: "transfer-print", image: "/images/cap.svg", note: "Curved-platen vinyl" },
  { title: "Market Shopping Bags", category: "screen-print", image: "/images/shopping-bag.svg", note: "2-colour canvas print" },
  { title: "Staff Uniform Program", category: "screen-print", image: "/images/uniform.svg", note: "Left chest + back print" },
  { title: "Grand Opening Backdrop", category: "clean-banners", image: "/images/backdrops.svg", note: "6m × 2.5m step-and-repeat" },
  { title: "Wedding Stationery Suite", category: "clean-banners", image: "/images/wedding-cards.svg", note: "Gold foil on pearl card" },
  { title: "Roll-up Banner Set", category: "clean-banners", image: "/images/rollup-banners.svg", note: "850 × 2000mm, ×12 units" },
  { title: "Delivery Fleet Branding", category: "van-display", image: "/images/vehicle-branding.svg", note: "Full wrap + laminate" },
  { title: "Keke Campaign Livery", category: "van-display", image: "/images/keke-branding.svg", note: "Cut vinyl, 40 units" },
  { title: "CEO Award Plaques", category: "engraving", image: "/images/plaques.svg", note: "Laser-engraved metal plates" },
  { title: "Framed Presentation Gift", category: "engraving", image: "/images/picture-framing.svg", note: "Engraved name plate" },
  { title: "Boutique Light Box", category: "signage", image: "/images/light-boxes.svg", note: "LED, dimmable face" },
  { title: "Shop Fascia Sign", category: "signage", image: "/images/shop-signs.svg", note: "ACP panel + cut letters" },
  { title: "Conference Jotters", category: "signage", image: "/images/jotters.svg", note: "Spiral bound, full colour" },
  { title: "Branded Mug Gift Packs", category: "others", image: "/images/branded-mugs.svg", note: "Full-wrap sublimation" },
];

export type BeforeAfter = {
  title: string;
  service: string;
  href: string;
  before: string;
  after: string;
  note: string;
};

export const beforeAfter: BeforeAfter[] = [
  {
    title: "Plain tee → branded event shirt",
    service: "Transfer Print",
    href: "/services/transfer-print",
    before: "/images/before-shirt.svg",
    after: "/images/after-shirt.svg",
    note: "100% cotton tee, full-colour DTF transfer applied with a 160°C heat press.",
  },
  {
    title: "Blank tote → shopping bag campaign",
    service: "Screen Print",
    href: "/services/screen-print",
    before: "/images/before-bag.svg",
    after: "/images/after-bag.svg",
    note: "Two-colour plastisol screen print, 500 pieces produced in one week.",
  },
  {
    title: "Unbranded van → moving billboard",
    service: "Van Display",
    href: "/services/van-display",
    before: "/images/before-van.svg",
    after: "/images/after-van.svg",
    note: "Cast vinyl wrap with contact details, contour cut and UV laminated.",
  },
  {
    title: "Dull shopfront → glowing light box",
    service: "Signage",
    href: "/services/signage",
    before: "/images/before-sign.svg",
    after: "/images/after-sign.svg",
    note: "LED light box fabricated, wired and installed above the entrance.",
  },
];

export const printableMaterials = [
  { name: "Fabric & Apparel", detail: "Cotton, polycotton, fleece, canvas, twill, satin, nylon" },
  { name: "Paper & Card", detail: "Art paper, ivory, pearl, kraft, gloss, silk and 300gsm board" },
  { name: "Vinyl & Films", detail: "Casting vinyl, one-way vision, reflective, transparent and magnetic" },
  { name: "Rigid substrates", detail: "Acrylic, PVC foam, foam board, ACP aluminium composite, wood" },
  { name: "Metals", detail: "Brass, aluminium, stainless steel for tags, plaques and name badges" },
  { name: "Glass, Crystal & Stone", detail: "Framed glass, crystal awards, marble plaques" },
  { name: "Ceramics & Drinkware", detail: "Mugs, bottles and ceramic giftware via sublimation" },
  { name: "Vehicles", detail: "Cars, buses, keke, vans and trucks — full or partial wraps" },
];

export const printSizes = [
  { group: "Stationery", sizes: ["Business card 85 × 55mm", "Flyer A6 / A5 / A4", "Poster A3 / A2 / A1", "Letterhead 216 × 279mm"] },
  { group: "Large format", sizes: ["Roll-up 850 × 2000mm", "Roll-up 1000 × 2000mm", "Banner 2 × 2m, 3 × 2m, 6 × 3m", "Backdrop 3 × 2.5m, 6 × 2.5m"] },
  { group: "Apparel", sizes: ["Kids 2–12 years", "S – M – L – XL – XXL – 3XL", "Custom-size uniforms", "Cap head sizes S / M / L"] },
  { group: "Signage & gifts", sizes: ["Name tag 60 × 20mm", "Shop sign any dimension", "Light box custom build", "Mug 11oz / 15oz"] },
];

export const printColors = [
  { name: "Kabaprints Blue", hex: "#1E6FA9" },
  { name: "Deep Blue", hex: "#14507E" },
  { name: "Coral", hex: "#E4795B" },
  { name: "Slate Grey", hex: "#96A1A6" },
  { name: "Ink Black", hex: "#101A24" },
  { name: "Pure White", hex: "#FFFFFF" },
  { name: "Sun Yellow", hex: "#F4C542" },
  { name: "Leaf Green", hex: "#2FA36B" },
];

export const colorNotes = [
  "Full CMYK process colour for photographic artwork",
  "Pantone spot matching on request (send us your PMS number)",
  "Neon, metallic gold/silver and glow-in-the-dark options",
  "RAL colours available for signage fabrication",
];

export type DesignService = { title: string; detail: string };

export const designServices: DesignService[] = [
  { title: "Logo Design & Refresh", detail: "Distinctive marks with full file handover — SVG, PNG, PDF and print-ready EPS." },
  { title: "Brand Identity Systems", detail: "Colour palette, typography, stationery and a usage guide your team can follow." },
  { title: "Flyers, Posters & Handbills", detail: "Campaign artwork built to print, from concept to press-ready PDF with bleed." },
  { title: "Social Media Graphics", detail: "Consistent post templates, stories and ad creatives sized for every platform." },
  { title: "Product & Packaging Artwork", detail: "Labels, cartons and wraps that stand out on the shelf and print flawlessly." },
  { title: "Vehicle & Signage Layouts", detail: "Scaled mock-ups of wraps, fascia signs and light boxes before anything is cut." },
];

export type DesignProcessStep = { step: string; title: string; detail: string };

export const designProcess: DesignProcessStep[] = [
  { step: "01", title: "Brief", detail: "Tell us the goal, audience, deadline and any ideas you already have." },
  { step: "02", title: "Concept", detail: "Our designers explore directions and share the strongest options with you." },
  { step: "03", title: "Revise", detail: "You review and we refine until every detail feels right — revisions included." },
  { step: "04", title: "Deliver", detail: "You receive print-ready and digital files, ready to go straight into production." },
];

export type SearchEntry = { title: string; href: string; description: string; type: string };
