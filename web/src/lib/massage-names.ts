// The massage types added by spa-setup.sql, for menus that load before the
// database answers. The spa list accepts a type by its name.
export const MASSAGE_NAMES = [
  "Swedish Massage",
  "Deep Tissue Massage",
  "Aromatherapy Massage",
  "Thai Massage",
  "Balinese Massage",
  "Hot Stone Massage",
  "Foot Reflexology",
  "Head and Shoulder Massage",
  "Ayurvedic Massage (Abhyanga)",
  "Couples Massage",
  "Four Hand Massage",
];

export function massageHref(name: string) {
  return `/spas?type=${encodeURIComponent(name)}`;
}
