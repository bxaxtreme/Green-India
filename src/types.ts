export type IssueCategory = 'Pothole / road damage' | 'River / water pollution' | 'Garbage / illegal dumping' | 'Plastic pollution' | 'Broken public bin' | 'Tree / green space' | 'Other';

export interface IssueReport {
  id: string;
  title: string;
  category: IssueCategory;
  description: string;
  address: string;
  city: string;
  state: string;
  imageUrl?: string;
  imageName?: string;
  reporterName: string;
  contactPhone?: string;
  createdAt: string;
  status: 'Received' | 'Under review' | 'Resolved';
  source: 'demo' | 'community' | 'local';
}

export interface Habit {
  id: string;
  label: string;
  done: boolean;
}