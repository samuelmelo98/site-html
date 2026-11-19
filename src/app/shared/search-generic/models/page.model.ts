export interface Page<T> {
  content: T[];

  totalElements: number;

  totalPages: number;

  size: number;

  number: number;
}

export interface PageResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
