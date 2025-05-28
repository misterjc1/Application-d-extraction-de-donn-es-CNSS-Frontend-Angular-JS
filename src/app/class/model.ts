export interface TableColumn {
    columnName: string;
    displayName: string;
    dataType: string;
    selected?: boolean;
  }
  
  export interface DatabaseTable {
    tableName: string;
    remarks: string;
    columns: TableColumn[];
    position?: { x: number, y: number };  // Ajouter position en option
    instanceId?: number;  // Ajout de instanceId (optionnel)

  }
  
  export interface TableRelation {
    sourceTable: string;
    sourceColumn: string;
    targetTable: string;
    targetColumn: string;
    table1: string; // Nom de la première table
  table2: string; // Nom de la seconde table
  }
  
  // Modifiez votre interface Condition
export interface Condition {
  field: string;       // Au lieu de 'column'
  operator: string;    // Même chose
  value: string;       // Même chose
  // Note: Le backend ne semble pas gérer logicalOperator dans Condition
}

// Modifiez QueryRequest
export interface QueryRequest {
  tables: string[];
  fields: string[];
  conditions: Condition[];
}
  