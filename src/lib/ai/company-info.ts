import bundledCompanyInfo from '@/data/company-knowledge.json';

export type CompanyInfo = typeof bundledCompanyInfo;

// The knowledge base ships with the site as a bundled JSON file.
export async function getCompanyInfo(): Promise<CompanyInfo> {
  return bundledCompanyInfo as CompanyInfo;
}
