import type { DealRoomInterestRow } from "@/components/properties/property-deal-room";
import type { IntroductionPurpose, IntroductionRequestRow } from "@/types/introduction-request";
import type { MeetingRequestType } from "@/types/meeting-request";
import type { PropertyDealActivityRow } from "@/types/deal-activity";

export type DealTimelineItem = {
  id: string;
  at: string;
  title: string;
  subtitle?: string;
};

const INTENT_LABEL: Record<DealRoomInterestRow["intent"], string> = {
  acquire: "Acquire",
  invest: "Invest",
  broker: "Broker",
  partner: "Partner",
};

const TARGET_LABEL: Record<IntroductionRequestRow["target_role"], string> = {
  developer: "Developer",
  investor: "Investor",
  broker: "Broker",
  partner: "Partner",
  acquisition_team: "Acquisition team",
};

const PURPOSE_LABEL: Record<IntroductionPurpose, string> = {
  explore_acquisition: "Explore acquisition",
  explore_investment: "Explore investment",
  explore_brokerage_marketing: "Brokerage / marketing",
  discuss_partnership: "Partnership",
  general_inquiry: "General inquiry",
};

const MEETING_LABEL: Record<MeetingRequestType, string> = {
  in_person: "In person",
  video_call: "Video call",
  phone_call: "Phone call",
};

export type MeetingTimelineRow = {
  id: string;
  meeting_type: MeetingRequestType;
  created_at: string;
};

function clip(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function buildDealActivityTimeline(input: {
  interests: DealRoomInterestRow[];
  introductions: IntroductionRequestRow[];
  meetings: MeetingTimelineRow[];
  activityEvents: PropertyDealActivityRow[];
}): DealTimelineItem[] {
  const items: DealTimelineItem[] = [];

  for (const row of input.interests) {
    items.push({
      id: `interest-${row.id}`,
      at: row.created_at,
      title: "Interest expressed",
      subtitle: `${INTENT_LABEL[row.intent]}${row.user_role ? ` · ${row.user_role}` : ""}`,
    });
  }

  for (const row of input.introductions) {
    items.push({
      id: `intro-${row.id}`,
      at: row.created_at,
      title: "Introduction requested",
      subtitle: `${TARGET_LABEL[row.target_role]} · ${PURPOSE_LABEL[row.purpose]}`,
    });
  }

  for (const row of input.meetings) {
    items.push({
      id: `meeting-${row.id}`,
      at: row.created_at,
      title: "Meeting requested",
      subtitle: MEETING_LABEL[row.meeting_type],
    });
  }

  for (const row of input.activityEvents) {
    if (row.event_type === "site_visit_planned") {
      items.push({
        id: `activity-${row.id}`,
        at: row.created_at,
        title: "Site visit planned",
        subtitle: "Field sheet opened for this parcel",
      });
    } else if (row.event_type === "notes_added") {
      const meta =
        row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
          ? (row.metadata as Record<string, unknown>)
          : {};
      const source = meta.source;
      const sourceLabel =
        source === "property"
          ? "Property notes"
          : source === "site_visit"
            ? "Site visit notes"
            : "Notes";
      items.push({
        id: `activity-${row.id}`,
        at: row.created_at,
        title: "Notes added",
        subtitle: row.detail ? clip(String(row.detail), 120) : sourceLabel,
      });
    }
  }

  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return items;
}
