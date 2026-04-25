export type CampaignType = "lightbox" | "floating_bar" | "slide_in" | "fullscreen" | "inline";

export interface Campaign {
  id: string;
  site_id: string;
  name: string;
  type: CampaignType;
  status: "draft" | "active" | "paused";
  headline: string;
  subheadline: string;
  button_text: string;
  success_message: string;
  display_rules: {
    delaySeconds: number;
    scrollPercent: number;
    exitIntent: boolean;
    urlContains: string;
    device: "all" | "desktop" | "mobile";
    frequencyHours: number;
  };
}
