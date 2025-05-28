export interface FilterCondition {
    table: string;
    column: string;
    operator: string;
    value: string;
    logicalOperator: 'AND' | 'OR';
  }
  
  export interface SortOption {
    field: string;
    direction: 'ASC' | 'DESC';
  }
  
  export interface FilterGroup {
    filterName: string;
    conditions: FilterCondition[];
    sort: SortOption | null;
  }