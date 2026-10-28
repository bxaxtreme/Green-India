import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { IssueReport } from '../types';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabaseConfigured = Boolean(url && key);
let client: SupabaseClient | null = null;

if (supabaseConfigured && url && key) {
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function publishReport(report: IssueReport, image?: File): Promise<'online' | 'local'> {
  if (!client) return 'local';

  let imageUrl: string | null = null;
  if (image) {
    const safeName = image.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-').slice(-90);
    const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const upload = await client.storage.from('issue-images').upload(path, image, {
      contentType: image.type,
      upsert: false
    });
    if (upload.error) throw new Error(`Image upload failed: ${upload.error.message}`);
    imageUrl = client.storage.from('issue-images').getPublicUrl(path).data.publicUrl;
  }

  const { error } = await client.from('issue_reports').insert({
    id: report.id,
    title: report.title,
    category: report.category,
    description: report.description,
    address: report.address,
    city: report.city,
    state: report.state,
    image_url: imageUrl,
    image_name: image?.name ?? null,
    reporter_name: report.reporterName,
    // Do not publish/store a reporter's optional mobile number in the shared public feed.
    status: 'Received',
    created_at: report.createdAt
  });
  if (error) throw new Error(`Could not publish report: ${error.message}`);
  return 'online';
}

export async function fetchPublicReports(): Promise<IssueReport[] | null> {
  if (!client) return null;
  // Load the public feed in pages so searches aren't restricted to only 100 newest reports.
  const pageSize = 500;
  const rows: Array<Record<string, unknown>> = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client.from('issue_reports')
      .select('id,title,category,description,address,city,state,image_url,image_name,reporter_name,created_at,status')
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`Could not load community reports: ${error.message}`);
    const page = (data ?? []) as Array<Record<string, unknown>>;
    rows.push(...page);
    if (page.length < pageSize || rows.length >= 20000) break;
  }
  return rows.map(row => ({
    id: String(row.id), title: String(row.title), category: row.category as IssueReport['category'],
    description: String(row.description), address: String(row.address), city: String(row.city),
    state: String(row.state), imageUrl: row.image_url ? String(row.image_url) : undefined,
    imageName: row.image_name ? String(row.image_name) : undefined,
    reporterName: String(row.reporter_name),
    createdAt: String(row.created_at), status: row.status as IssueReport['status'], source: 'community'
  }));
}