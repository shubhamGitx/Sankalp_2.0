export interface Gallery {
  GID: number;
  Title: string;
  Description: string;
  ImagePath: string;
  DisplayOrder: number;
  Status?: string;
  createdBy?: string;
  createdOn?: string;
}