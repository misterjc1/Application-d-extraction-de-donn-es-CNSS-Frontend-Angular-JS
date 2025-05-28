import { Injectable } from '@angular/core';
import { DatabaseTable, QueryRequest, TableRelation } from '../class/model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RequeteService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  // Récupérer les métadonnées des tables
  getSchema(): Observable<DatabaseTable[]> {
      return this.http.get<DatabaseTable[]>(`${this.apiUrl}/metadata`);
  }

  // Exécuter une requête SQL
  executeQuery(request: QueryRequest): Observable<any[]> {
    console.log("Requête envoyée au backend:", request);
    return this.http.post<any[]>(`${this.apiUrl}/query`, request);
  }
  // Récupérer les relations entre tables
  getTableRelations(): Observable<TableRelation[]> {
    return this.http.get<TableRelation[]>(`${this.apiUrl}/relations`);
  }

}
