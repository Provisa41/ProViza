export type VisaNewsItem = {
  id: string;
  countryId: string;
  date: string;
  title: string;
  summary: string;
  tag?: string;
  /** Показывается для всех стран региона (напр. общие новости Шенгена) */
  region?: string;
};

export type VisaTypeInfo = {
  id: string;
  name: string;
  purpose: string;
  processing: string;
  documents: string[];
  notes?: string;
};

export type CountryInfo = {
  id: string;
  flag: string;
  name: string;
  region: string;
  summary: string;
  visaTypes: VisaTypeInfo[];
};
