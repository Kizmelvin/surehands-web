export type UUID = string;

export type UserRole = "client" | "worker" | "admin";
export type JobStatus = "open" | "closed" | "canceled";
export type ProposalStatus = "submitted" | "accepted" | "rejected" | "withdrawn";
export type VerificationStatus = "pending" | "approved" | "rejected";

export type ServiceCategory = {
  id: UUID;
  name: string;
  created_at: string;
};

export type OperatingRegion = {
  id: UUID;
  region_name: string;
  sla_timeout_minutes: number;
  max_matching_radius_km: number;
  is_active: boolean;
};

export type Profile = {
  id: UUID;
  role: UserRole;
  phone: string | null;
  email: string | null;
  full_name: string | null;
  nin_verified: boolean;
  state_of_origin: string | null;
  lga_of_origin: string | null;
  resident_city: string | null;
  operating_state: string | null;
  operating_city: string | null;
  created_at: string;
};

export type Worker = {
  user_id: UUID;
  region_id: UUID | null;
  residential_address: string | null;
  verification_photo_url: string | null;
  tools_photos_urls: string[];
  skill_video_url: string | null;
  has_skill_video: boolean;
  verification_status: VerificationStatus | string;
  is_visible: boolean;
  is_available: boolean;
  created_at: string;
};

export type Job = {
  id: UUID;
  client_user_id: UUID;
  region_id: UUID | null;
  category_id: UUID | null;
  title: string | null;
  description: string | null;
  status: JobStatus;
  requires_admin_intervention: boolean;
  created_at: string;
  updated_at: string;
};

export type JobProposal = {
  id: UUID;
  job_id: UUID;
  worker_user_id: UUID;
  status: ProposalStatus;
  message: string | null;
  quoted_price: number | null;
  created_at: string;
  updated_at: string;
};

export type WorkerCard = {
  user_id: UUID;
  full_name: string;
  category: string;
  rating: number;
  jobs_completed: number;
  distance_km: number;
  is_available: boolean;
  nin_verified: boolean;
  has_skill_video: boolean;
  hourly_rate: number;
  photo_url: string | null;
  bio: string;
  skills: string[];
};

export type JobCard = {
  id: UUID;
  title: string;
  description: string;
  category: string;
  location_label: string;
  distance_km: number;
  budget: number;
  status: JobStatus;
  posted_at: string;
  client_name: string;
  proposals_count: number;
};
