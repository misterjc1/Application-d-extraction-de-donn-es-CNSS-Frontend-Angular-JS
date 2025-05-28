// Import des modules nécessaires depuis Angular et autres librairies
import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { RequeteService } from 'src/app/services/requete.service';
import { Condition, DatabaseTable, QueryRequest, TableColumn, TableRelation } from 'src/app/class/model';
import { FilterCondition, SortOption } from 'src/app/class/filter.model';
import { MatDialog } from '@angular/material/dialog';
import { NotificationDialogComponent } from '../../notification-dialog/notification-dialog.component';

// Interface pour représenter une ligne de relation entre tables
interface RelationLine {
  sourceTable: string;
  targetTable: string;
  line: SVGLineElement;
  text?: SVGTextElement;  
}

// Décorateur Component avec métadonnées
@Component({
  selector: 'app-construire-requete',
  templateUrl: './construire-requete.component.html',
  styleUrls: ['./construire-requete.component.scss']
})
export class ConstruireRequeteComponent implements OnInit, AfterViewInit {
  // Références aux éléments du template
  @ViewChild('workspace') workspace!: ElementRef; // Référence à l'élément HTML du workspace
  @ViewChild('relationSvg', { static: true }) relationSvg!: ElementRef<SVGSVGElement>;
  @ViewChild('workspaceTop') workspaceTop!: ElementRef<HTMLElement>;
  @ViewChild('dropZone') dropZone!: ElementRef;

  
  // Propriétés de la classe
  Object = Object; // Référence à l'objet global Object
  loading = false; // Indicateur de chargement
  availableTables: DatabaseTable[] = []; // Liste des tables disponibles
  selectedTables: DatabaseTable[] = []; // Tables sélectionnées par l'utilisateur
  tableRelations: TableRelation[] = []; // Relations entre les tables
  queryResults: any[] = []; // Résultats de la requête SQL
  conditions: Condition[] = [];
  dynamicRelations: any[] = []; // Relations dynamiques
  relationLines: RelationLine[] = []; // Lignes de relations
  resultsCollapsed = false;
  showConditionModal = false;
  isLoggedIn = false;
  activeFilters: FilterCondition[] = []; // Modifiez cette ligne
  activeSort: SortOption | null = null; // Ajoutez cette ligne
  showSidebar: boolean = true;
  sqlPreviewText: string = '';

  

  // Propriété pour suivre les relations dessinées
  drawnRelations: { 
    sourceTable: string, 
    targetTable: string, 
    sourceX: number, 
    sourceY: number, 
    targetX: number, 
    targetY: number 
  }[] = [];

  // Constructeur avec injection de dépendances
  constructor(
    private requeteService: RequeteService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  /**
   * Méthode exécutée à l'initialisation du composant
   */
  ngOnInit() {
    this.loadAvailableTables(); // Charge les tables disponibles
    this.loadTableRelations(); // Charge les relations entre tables
  }

  /**
   * Méthode exécutée après l'initialisation de la vue
   */
  ngAfterViewInit() {
    // Délai pour s'assurer que le DOM est complètement rendu
    setTimeout(() => this.updateRelationLines(), 100);
    this.setupScrollListener();
  }

  /**
   * Charge les tables disponibles depuis le service
   */
  loadAvailableTables() {
    this.requeteService.getSchema().subscribe(
      (tables) => (this.availableTables = tables),
      (error) => console.error("Erreur lors du chargement des tables", error)
    );
  }

  /**
   * Configure l'écouteur d'événement pour le scroll
   */
  private setupScrollListener() {
    const workspaceEl = this.workspaceTop.nativeElement;
    
    workspaceEl.addEventListener('scroll', () => {
      this.updateRelationLines();
    });
  }

  // Méthodes pour gérer le modal
openConditionModal() {
  this.showConditionModal = true;
}

closeConditionModal() {
  this.showConditionModal = false;
}

toggleSidebar() {
  this.showSidebar = !this.showSidebar;
}

showNotification(message: string, success: boolean) {
  this.dialog.open(NotificationDialogComponent, {
    data: { message, success },
    panelClass: 'no-padding-dialog',
    disableClose: true
  });
}


resultsHeight = 300; // hauteur initiale en pixels
isResizing = false;

startResizing(event: MouseEvent) {
  this.isResizing = true;
  const startY = event.clientY;
  const startHeight = this.resultsHeight;

  const onMouseMove = (moveEvent: MouseEvent) => {
    const dy = moveEvent.clientY - startY;
    this.resultsHeight = Math.max(100, startHeight - dy); // limite minimale de 100px
  };

  const onMouseUp = () => {
    this.isResizing = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

defaultResultsHeight = 100; // même que la valeur initiale

resetResultsHeight() {
  this.resultsHeight = this.defaultResultsHeight;
}




login() {
  // Implémente ici ta logique réelle de login
  this.isLoggedIn = true;
}

logout() {
  // Implémente ici ta logique réelle de logout
  this.isLoggedIn = false;
}

/*clearAll(): void {
  this.selectedTables = [];
  this.queryResults = [];
  this.showConditionModal = false;

  // Reset des colonnes dans availableTables
  this.availableTables.forEach(table => {
    table.columns.forEach(column => {
      column.selected = false;
    });
  });

  // Nettoyage du SVG
  const svg = this.relationSvg?.nativeElement;
  if (svg) {
    Array.from(svg.children).forEach(child => {
      if (child.nodeName !== 'defs') {
        svg.removeChild(child);
      }
    });
  }

  // Recharge les relations
  this.loadTableRelations();

  this.cdr.detectChanges();
}*/




/*handleConditionAdded(condition: any) {
  this.conditions.push(condition);
  // Optionnel : exécuter la requête automatiquement
  // Exécuter automatiquement la requête après ajout de conditions
  this.executeQuery();
}
*/
  /**
   * Charge les relations entre tables depuis le service
   */
  loadTableRelations() {
    this.requeteService.getTableRelations().subscribe(
      (relations) => {
        this.tableRelations = relations;
        // Délai pour s'assurer que les tables sont rendues
        setTimeout(() => this.updateRelationLines(), 100);
      },
      (error) => console.error("Erreur lors du chargement des relations", error)
    );
  }

  // Ajoutez ces méthodes
toggleResults() {
  this.resultsCollapsed = !this.resultsCollapsed;
}

closeResults() {
  this.queryResults = [];
  this.resultsCollapsed = false;
}

  /**
   * Met à jour les lignes de relation entre les tables
   */
  updateRelationLines() {
    if (!this.relationSvg?.nativeElement) return;

    // Efface les lignes et textes existants
    this.relationSvg.nativeElement.innerHTML = `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#4285F4" />
        </marker>
      </defs>
    `;

    this.relationLines = [];

    // Dessine les lignes pour chaque relation
    this.tableRelations.forEach(relation => {
      const sourceTable = this.selectedTables.find(t => t.tableName === relation.sourceTable);
      const targetTable = this.selectedTables.find(t => t.tableName === relation.targetTable);

      if (sourceTable && targetTable) {
        this.drawRelationLine(sourceTable, targetTable, relation);
      }
    });
  }

  /**
   * Dessine une ligne de relation entre deux tables
   * @param sourceTable Table source
   * @param targetTable Table cible
   * @param relation Relation entre les tables
   */
  drawRelationLine(sourceTable: DatabaseTable, targetTable: DatabaseTable, relation: TableRelation) {
    if (!this.relationSvg?.nativeElement) return;

    const sourceEl = document.querySelector(`[data-table-name="${sourceTable.tableName}"]`) as HTMLElement;
    const targetEl = document.querySelector(`[data-table-name="${targetTable.tableName}"]`) as HTMLElement;

    if (!sourceEl || !targetEl) return;

    // Obtenez la position du conteneur drop-zone
    const dropZone = this.workspaceTop.nativeElement.querySelector('.drop-zone') as HTMLElement;
    if (!dropZone) return;
    
    const dropZoneRect = dropZone.getBoundingClientRect();
    
    // Calculez les positions relatives à la drop-zone
    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    
    // Positions relatives
    const sourceCenter = {
      x: sourceRect.left - dropZoneRect.left + sourceRect.width / 2,
      y: sourceRect.top - dropZoneRect.top + sourceRect.height / 2
    };
    
    const targetCenter = {
      x: targetRect.left - dropZoneRect.left + targetRect.width / 2,
      y: targetRect.top - dropZoneRect.top + targetRect.height / 2
    };
    
    // Déterminer les points de connexion optimaux
    const connectionPoints = this.findOptimalConnectionPoints(
      sourceRect, targetRect, dropZoneRect, sourceTable, targetTable
    );
    
    const sourceX = connectionPoints.sourceX;
    const sourceY = connectionPoints.sourceY;
    const targetX = connectionPoints.targetX;
    const targetY = connectionPoints.targetY;
    
    // Créer SVG line avec courbe Bezier
    const svgNS = "http://www.w3.org/2000/svg";
    
    // Utiliser un path pour une ligne courbe
    const path = document.createElementNS(svgNS, 'path') as SVGPathElement;
    
    // Calculer les points de contrôle pour la courbe de Bézier
    const dx = Math.abs(targetX - sourceX) * 0.5;
    
    // Définir le chemin de la courbe
    let pathData = `M${sourceX},${sourceY} `;
    
    // Si les tables sont plus ou moins alignées horizontalement
    if (Math.abs(sourceY - targetY) < 50) {
      pathData += `C${sourceX + dx},${sourceY} ${targetX - dx},${targetY} ${targetX},${targetY}`;
    } 
    // Si elles sont plus ou moins alignées verticalement
    else if (Math.abs(sourceX - targetX) < 50) {
      const dy = Math.abs(targetY - sourceY) * 0.5;
      pathData += `C${sourceX},${sourceY + dy} ${targetX},${targetY - dy} ${targetX},${targetY}`;
    }
    // Dans les autres cas, courbe standard
    else {
      pathData += `C${sourceX + dx},${sourceY} ${targetX - dx},${targetY} ${targetX},${targetY}`;
    }
    
    // Configuration du path
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#4285F4');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('marker-end', 'url(#arrowhead)');
    
    // Ajouter le texte de la relation au milieu de la courbe
    const text = document.createElementNS(svgNS, 'text');
    const midPoint = this.getPointOnCurve(sourceX, sourceY, targetX, targetY, 0.5);
    
    // Configuration du texte
    text.setAttribute('x', `${midPoint.x}`);
    text.setAttribute('y', `${midPoint.y - 5}`); // Légèrement au-dessus de la ligne
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', '#555');
    text.setAttribute('font-size', '10px');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('stroke', 'white');
    text.setAttribute('stroke-width', '0.5');
    text.setAttribute('paint-order', 'stroke');
    text.textContent = `${relation.sourceColumn} → ${relation.targetColumn}`;
    
    // Ajout des éléments au SVG
    this.relationSvg.nativeElement.appendChild(path);
    this.relationSvg.nativeElement.appendChild(text);
    
    // Stockage de la relation
    this.relationLines.push({
      sourceTable: sourceTable.tableName,
      targetTable: targetTable.tableName,
      line: path as any, // Cast nécessaire
      text: text
    });
  }
  
  /**
   * Trouve les points de connexion optimaux entre deux tables
   * @param sourceRect Rectangle de la table source
   * @param targetRect Rectangle de la table cible
   * @param dropZoneRect Rectangle de la zone de dépôt
   * @param sourceTable Table source
   * @param targetTable Table cible
   * @returns Points de connexion optimaux
   */
  findOptimalConnectionPoints(
    sourceRect: DOMRect, 
    targetRect: DOMRect, 
    dropZoneRect: DOMRect, 
    sourceTable: DatabaseTable, 
    targetTable: DatabaseTable
  ) {
    // Points potentiels sur les bords de chaque table
    const sourcePoints = [
      { x: sourceRect.left - dropZoneRect.left, y: sourceRect.top - dropZoneRect.top + sourceRect.height / 2 }, // Gauche
      { x: sourceRect.right - dropZoneRect.left, y: sourceRect.top - dropZoneRect.top + sourceRect.height / 2 }, // Droite
      { x: sourceRect.left - dropZoneRect.left + sourceRect.width / 2, y: sourceRect.top - dropZoneRect.top }, // Haut
      { x: sourceRect.left - dropZoneRect.left + sourceRect.width / 2, y: sourceRect.bottom - dropZoneRect.top } // Bas
    ];
  
    const targetPoints = [
      { x: targetRect.left - dropZoneRect.left, y: targetRect.top - dropZoneRect.top + targetRect.height / 2 }, // Gauche
      { x: targetRect.right - dropZoneRect.left, y: targetRect.top - dropZoneRect.top + targetRect.height / 2 }, // Droite
      { x: targetRect.left - dropZoneRect.left + targetRect.width / 2, y: targetRect.top - dropZoneRect.top }, // Haut
      { x: targetRect.left - dropZoneRect.left + targetRect.width / 2, y: targetRect.bottom - dropZoneRect.top } // Bas
    ];
  
    // Trouver la meilleure paire de points
    let bestDistance = Infinity;
    let bestSourcePoint = sourcePoints[0];
    let bestTargetPoint = targetPoints[0];
  
    sourcePoints.forEach(sourcePoint => {
      targetPoints.forEach(targetPoint => {
        const distance = Math.sqrt(
          Math.pow(sourcePoint.x - targetPoint.x, 2) + 
          Math.pow(sourcePoint.y - targetPoint.y, 2)
        );
        
        if (distance < bestDistance) {
          bestDistance = distance;
          bestSourcePoint = sourcePoint;
          bestTargetPoint = targetPoint;
        }
      });
    });
  
    return {
      sourceX: bestSourcePoint.x,
      sourceY: bestSourcePoint.y,
      targetX: bestTargetPoint.x,
      targetY: bestTargetPoint.y
    };
  }
  
  /**
   * Calcule un point sur une courbe de Bézier
   * @param x1 Coordonnée x du point de départ
   * @param y1 Coordonnée y du point de départ
   * @param x2 Coordonnée x du point d'arrivée
   * @param y2 Coordonnée y du point d'arrivée
   * @param t Position sur la courbe (0-1)
   * @returns Point sur la courbe
   */
  getPointOnCurve(x1: number, y1: number, x2: number, y2: number, t: number) {
    // Pour une ligne droite, l'interpolation linéaire suffit
    return {
      x: x1 + (x2 - x1) * t,
      y: y1 + (y2 - y1) * t
    };
  }

  /**
   * Organise automatiquement les tables de manière optimale
   */
  organizeTablesOptimally() {
    const tableWidth = 150;
    const tableHeight = 200;
    const padding = 100; // Espace entre les tables
    
    // Construire un graphe de relations
    const graph = new Map<string, string[]>();
    
    // Initialiser le graphe
    this.selectedTables.forEach(table => {
      graph.set(table.tableName, []);
    });
    
    // Remplir le graphe avec les relations
    this.tableRelations.forEach(relation => {
      const sourceTable = this.selectedTables.find(t => t.tableName === relation.sourceTable);
      const targetTable = this.selectedTables.find(t => t.tableName === relation.targetTable);
      
      if (sourceTable && targetTable) {
        const sourceNeighbors = graph.get(sourceTable.tableName) || [];
        const targetNeighbors = graph.get(targetTable.tableName) || [];
        
        if (!sourceNeighbors.includes(targetTable.tableName)) {
          sourceNeighbors.push(targetTable.tableName);
        }
        
        if (!targetNeighbors.includes(sourceTable.tableName)) {
          targetNeighbors.push(sourceTable.tableName);
        }
        
        graph.set(sourceTable.tableName, sourceNeighbors);
        graph.set(targetTable.tableName, targetNeighbors);
      }
    });
    
    // Déterminer les niveaux (rangées) en fonction des relations
    const levels = new Map<string, number>();
    const visited = new Set<string>();
    
    // Première passe pour déterminer les niveaux
    const assignLevels = (tableName: string, level: number) => {
      if (visited.has(tableName)) return;
      
      visited.add(tableName);
      levels.set(tableName, Math.max(levels.get(tableName) || 0, level));
      
      const neighbors = graph.get(tableName) || [];
      neighbors.forEach(neighbor => {
        assignLevels(neighbor, level + 1);
      });
    };
    
    // Commencer par les tables sans prédécesseurs ou les premières tables
    this.selectedTables.forEach(table => {
      if (!visited.has(table.tableName)) {
        assignLevels(table.tableName, 0);
      }
    });
    
    // Organiser les tables par niveau
    const tablesByLevel = new Map<number, string[]>();
    
    levels.forEach((level, tableName) => {
      if (!tablesByLevel.has(level)) {
        tablesByLevel.set(level, []);
      }
      
      const tablesAtLevel = tablesByLevel.get(level) || [];
      tablesAtLevel.push(tableName);
      tablesByLevel.set(level, tablesAtLevel);
    });
    
    // Positionner les tables par niveau
    const startX = 50;
    const startY = 50;
    
    tablesByLevel.forEach((tableNames, level) => {
      const y = startY + level * (tableHeight + padding);
      
      tableNames.forEach((tableName, index) => {
        const table = this.selectedTables.find(t => t.tableName === tableName);
        if (table) {
          const x = startX + index * (tableWidth + padding);
          table.position = { x, y };
        }
      });
    });
    
    // Mettre à jour les relations
    setTimeout(() => this.updateRelationLines(), 100);
    
    // Ajuster la taille de la zone de dépôt
    this.adjustDropZoneSize();
  }

  /**
   * Gère le déplacement d'une table
   * @param event Événement de déplacement
   * @param movedTable Table déplacée
   */
  onTableMove(event: CdkDragMove, movedTable: DatabaseTable) {
    movedTable.position = {
      x: event.source.getFreeDragPosition().x,
      y: event.source.getFreeDragPosition().y
    };
    
    // Vérifier s'il y a collision avec d'autres tables
    this.checkAndPreventCollisions(movedTable);
    
    this.updateRelationLines();
  }


  
  
  /**
   * Vérifie et prévient les collisions entre tables
   * @param movedTable Table déplacée
   */
  checkAndPreventCollisions(movedTable: DatabaseTable) {
    const tableWidth = 150;  // Largeur estimée des tables
    const tableHeight = 200; // Hauteur estimée des tables
    const minDistance = 20;  // Distance minimale entre les tables
    
    // Vérifier chaque autre table pour des collisions potentielles
    this.selectedTables.forEach(otherTable => {
      // Ignorer la table en cours de déplacement
      if (otherTable.instanceId === movedTable.instanceId) return;
      
      const movedX = movedTable.position?.x || 0;
      const movedY = movedTable.position?.y || 0;
      const otherX = otherTable.position?.x || 0;
      const otherY = otherTable.position?.y || 0;
      
      // Vérifier si les tables se chevauchent ou sont trop proches
      if (Math.abs(movedX - otherX) < tableWidth - minDistance && 
          Math.abs(movedY - otherY) < tableHeight - minDistance) {
        
        // Calculer une nouvelle position pour éviter le chevauchement
        const directionX = movedX > otherX ? 1 : -1;
        const directionY = movedY > otherY ? 1 : -1;
        
        // Décaler légèrement pour éviter la collision
        if (Math.abs(movedX - otherX) < Math.abs(movedY - otherY)) {
          // Décalage horizontal
          movedTable.position!.x += directionX * (tableWidth - Math.abs(movedX - otherX) + minDistance);
        } else {
          // Décalage vertical
          movedTable.position!.y += directionY * (tableHeight - Math.abs(movedY - otherY) + minDistance);
        }
      }
    });
  }

  /**
   * Obtient le rectangle d'une table dans le DOM
   * @param table Table à trouver
   * @returns Rectangle de la table ou null
   */
  getTableElementRect(table: DatabaseTable): DOMRect | null {
    const tableElement = document.querySelector(`.table-box[data-table-name="${table.tableName}"]`) as HTMLElement;
    return tableElement ? tableElement.getBoundingClientRect() : null;
  }

  /**
   * Calcule les points de connexion les plus proches entre deux tables
   * @param sourceRect Rectangle de la table source
   * @param targetRect Rectangle de la table cible
   * @returns Points de connexion
   */
  calculateConnectionPoints(sourceRect: DOMRect, targetRect: DOMRect) {
    // Points centraux initiaux
    let x1 = sourceRect.left + sourceRect.width / 2;
    let y1 = sourceRect.top + sourceRect.height / 2;
    let x2 = targetRect.left + targetRect.width / 2;
    let y2 = targetRect.top + targetRect.height / 2;

    // Calcul des points d'extrémité sur les bords des tables
    const directions = [
      { x: sourceRect.left, y: sourceRect.top + sourceRect.height / 2 },     // Left
      { x: sourceRect.right, y: sourceRect.top + sourceRect.height / 2 },    // Right
      { x: sourceRect.left + sourceRect.width / 2, y: sourceRect.top },      // Top
      { x: sourceRect.left + sourceRect.width / 2, y: sourceRect.bottom }    // Bottom
    ];

    const targetDirections = [
      { x: targetRect.left, y: targetRect.top + targetRect.height / 2 },
      { x: targetRect.right, y: targetRect.top + targetRect.height / 2 },
      { x: targetRect.left + targetRect.width / 2, y: targetRect.top },
      { x: targetRect.left + targetRect.width / 2, y: targetRect.bottom }
    ];

    // Trouver les points les plus proches
    let minDistance = Infinity;
    directions.forEach(source => {
      targetDirections.forEach(target => {
        const distance = Math.sqrt(
          Math.pow(source.x - target.x, 2) + Math.pow(source.y - target.y, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          x1 = source.x;
          y1 = source.y;
          x2 = target.x;
          y2 = target.y;
        }
      });
    });

    return { x1, y1, x2, y2 };
  }


  /**
   * Dispose les tables avec un espacement défini
   */
  arrangeTables() {
    const tableWidth = 150;  // Largeur estimée des tables
    const tableHeight = 200; // Hauteur estimée des tables
    
    const gapX = tableWidth + 100; // Espacement horizontal
    const gapY = tableHeight + 100; // Espacement vertical
    
    const startX = 50;
    const startY = 50;
    
    const maxTablesPerRow = 3; // Nombre maximum de tables par ligne
    
    this.selectedTables.forEach((table, index) => {
      const row = Math.floor(index / maxTablesPerRow);
      const col = index % maxTablesPerRow;
      
      // Positionnement de la table
      table.position = {
        x: startX + col * gapX,
        y: startY + row * gapY
      };
    });
    
    // Redessiner les relations
    setTimeout(() => this.updateRelationLines(), 100);
    
    // Ajuster la taille de la zone de drop
    this.adjustDropZoneSize();
  }
  
  /**
   * Ajuste la taille de la zone de dépôt pour accommoder toutes les tables
   */
  adjustDropZoneSize() {
    const dropZone = this.workspaceTop.nativeElement.querySelector('.drop-zone') as HTMLElement;
    
    // Vérifier que dropZone existe
    if (!dropZone) return;
    
    // Trouver la table la plus à droite et la plus basse
    let maxRight = 0;
    let maxBottom = 0;
    
    this.selectedTables.forEach(table => {
      const right = (table.position?.x || 0) + 150; // x + largeur estimée
      const bottom = (table.position?.y || 0) + 200; // y + hauteur estimée
      
      maxRight = Math.max(maxRight, right);
      maxBottom = Math.max(maxBottom, bottom);
    });
    
    // Ajouter une marge supplémentaire
    const minWidth = maxRight + 150;
    const minHeight = maxBottom + 150;
    
    // Appliquer les dimensions minimales à la zone de dépôt
    dropZone.style.minWidth = `${minWidth}px`;
    dropZone.style.minHeight = `${minHeight}px`;
  }

  /**
   * Met en évidence les tables connectées à la table sélectionnée
   * @param table Table sélectionnée
   */
  highlightConnectedTables(table: DatabaseTable) {
    // Réinitialiser toutes les ombres
    document.querySelectorAll('.table-box').forEach((el: any) => {
      el.style.boxShadow = 'none';
    });
    
    // Trouver les tables connectées
    const connectedTables = this.tableRelations
      .filter(rel => rel.sourceTable === table.tableName || rel.targetTable === table.tableName)
      .map(rel => rel.sourceTable === table.tableName ? rel.targetTable : rel.sourceTable);
    
    // Appliquer une ombre aux tables connectées
    connectedTables.forEach(tableName => {
      const el = document.querySelector(`.table-box[data-table-name="${tableName}"]`) as HTMLElement;
      if (el) {
        el.style.boxShadow = '0 0 0 2px #FF5722';
      }
    });
    
    // Appliquer une ombre différente à la table sélectionnée
    const selectedEl = document.querySelector(`.table-box[data-table-name="${table.tableName}"]`) as HTMLElement;
    if (selectedEl) {
      selectedEl.style.boxShadow = '0 0 0 2px #4285F4';
    }
  }

  /**
   * Récupère la position X ou Y d'une table donnée
   * @param tableName Nom de la table
   * @param axis Axe ('x' ou 'y')
   * @returns Position sur l'axe
   */
  getTablePosition(tableName: string, axis: 'x' | 'y'): number {
    const table = this.selectedTables.find(t => t.tableName === tableName);
    return table?.position?.[axis] ?? 0;
  }

  /**
   * Exécute la requête SQL construite
   */
  /*executeQuery() {
    this.loading = true; // Active l'indicateur de chargement
    this.queryResults = []; // Réinitialise les résultats

    const selectedFields: string[] = []; // Liste des champs sélectionnés
    const selectedTables: string[] = []; // Liste des tables utilisées

    // Parcourt les tables sélectionnées pour récupérer les colonnes cochées
    this.selectedTables.forEach(table => {
      const selectedCols = table.columns
        .filter(col => col.selected)
        .map(col => `${table.tableName}.${col.columnName}`);

      if (selectedCols.length > 0) {
        selectedFields.push(...selectedCols);
        selectedTables.push(table.tableName);
      }
    });

    if (selectedFields.length === 0) {
      return; // Arrête l'exécution si aucune colonne n'est sélectionnée
    }

    // Construction de la requête
    const queryRequest: QueryRequest = {
      tables: selectedTables,
      fields: selectedFields,
      conditions: this.conditions
    };

    // Envoie la requête via le service
    this.requeteService.executeQuery(queryRequest).subscribe(
      (results) => {
        this.queryResults = results;
      },
      (error) => {
        console.error("Erreur lors de l'exécution de la requête", error);
      }
    );
  }*/
// quand on selctionne rien , l'execution passe 
    /*executeQuery() {
      if (this.selectedTables.length === 0) {
        this.queryResults = [];
        this.showNotification('Aucune table sélectionnée.', false);
        return;
      }
    
      this.loading = true;
    
      const selectedFields: string[] = [];
      const selectedTablesNames: string[] = [];
    
      this.selectedTables.forEach(table => {
        const selectedCols = table.columns
          .filter(col => col.selected)
          .map(col => `${table.tableName}.${col.columnName}`);
    
        if (selectedCols.length > 0) {
          selectedFields.push(...selectedCols);
          selectedTablesNames.push(table.tableName);
        }
      });
    
      if (selectedFields.length === 0) {
        this.selectedTables.forEach(table => {
          selectedFields.push(...table.columns.map(col => `${table.tableName}.${col.columnName}`));
          selectedTablesNames.push(table.tableName);
        });
      }
    
      const queryRequest: QueryRequest = {
        tables: selectedTablesNames,
        fields: selectedFields,
        conditions: this.conditions
      };
    
      console.log('Requête envoyée:', queryRequest);
    
      this.requeteService.executeQuery(queryRequest).subscribe(
        (results) => {
          this.queryResults = results;
          this.loading = false;
          this.showNotification('Requête exécutée avec succès ✅', true);
        },
        (error) => {
          console.error("Erreur lors de l'exécution de la requête", error);
          this.loading = false;
          this.showNotification("Échec de l'exécution de la requête ❌", false);
        }
      );
    }*/

      executeQuery() {
        // Aucune table sélectionnée
        if (this.selectedTables.length === 0) {
          this.queryResults = [];
          this.showNotification('Aucune table sélectionnée ❌', false);
          return;
        }
      
        this.loading = true;
      
        const selectedFields: string[] = [];
        const selectedTablesNames: string[] = [];
      
        // Construction des champs sélectionnés
        this.selectedTables.forEach(table => {
          const selectedCols = table.columns
            .filter(col => col.selected)
            .map(col => `${table.tableName}.${col.columnName}`);
      
          if (selectedCols.length > 0) {
            selectedFields.push(...selectedCols);
            selectedTablesNames.push(table.tableName);
          }
        });
      
        // Vérification : aucune colonne sélectionnée
        if (selectedFields.length === 0) {
          this.loading = false;
          this.showNotification('Aucune colonne sélectionnée ❌', false);
          return;
        }
      
        const queryRequest: QueryRequest = {
          tables: selectedTablesNames,
          fields: selectedFields,
          conditions: this.conditions
        };
      
        console.log('Requête envoyée:', queryRequest);
      
        this.requeteService.executeQuery(queryRequest).subscribe(
          (results) => {
            this.queryResults = results;
            this.loading = false;
      
            if (results.length === 0) {
              this.showNotification('Requête exécutée, mais aucun résultat trouvé ⚠️', false);
            } else {
              this.showNotification('Requête exécutée avec succès ✅', true);
            }
          },
          (error) => {
            console.error("Erreur lors de l'exécution de la requête", error);
            this.loading = false;
            this.showNotification("Échec de l'exécution de la requête ❌", false);
          }
        );
      }
      
    
    savedConditions: Condition[] = [];  // Liste des conditions sauvegardées

    handleConditionAdded(conditions: Condition[]) {
      // On ajoute les nouvelles conditions aux anciennes
      this.conditions = [...this.conditions, ...conditions];  // Ajoute les nouvelles conditions aux anciennes
    
      // Exécution automatique de la requête après l'ajout de conditions
      this.executeQuery(); // Exécution de la requête avec toutes les conditions
    }
    


  /**
   * Simule l'exportation des résultats en PDF
   */
  exportToPDF() {
    
  }

  exportToExcel() {
    
  }


  

  //savedConditions: Condition[] = [];

onConditionsApplied(conditions: Condition[]) {
  this.savedConditions = [...conditions];
  // Tu peux aussi les envoyer à l'API ici si besoin
}


  /**
   * Supprime une table du workspace
   * @param tableToRemove Table à supprimer
   */

  // Ajoutez cette méthode pour réinitialiser les conditions
resetConditions() {
  this.conditions = [];
}
  // Modifiez removeTable pour réinitialiser les conditions quand la dernière table est supprimée
removeTable(tableToRemove: DatabaseTable) {
  this.selectedTables = this.selectedTables.filter(table => table.instanceId !== tableToRemove.instanceId);
  
  if (this.selectedTables.length === 0) {
    this.resetConditions();
    this.queryResults = [];
  }
  
  this.updateRelationLines();
}

// Modifiez clearAll pour tout réinitialiser
clearAll(): void {
  this.selectedTables = [];
  this.queryResults = [];
  this.resetConditions();
  this.showConditionModal = false;
  
  // Reset des colonnes dans availableTables
  this.availableTables.forEach(table => {
    table.columns.forEach(column => {
      column.selected = false;
    });
  });
  
  // Nettoyage du SVG
  const svg = this.relationSvg?.nativeElement;
  if (svg) {
    Array.from(svg.children).forEach(child => {
      if (child.nodeName !== 'defs') {
        svg.removeChild(child);
      }
    });
  }
  
  this.loadTableRelations();
  this.cdr.detectChanges();
}


  /**
 * Crée une instance unique d'une table avec une configuration par défaut
 * @param table Table à dupliquer
 * @returns Nouvelle instance de la table
 */
private createTableInstance(table: DatabaseTable): DatabaseTable {
  return {
    ...table,
    instanceId: Date.now() + Math.random(), // Identifiant unique
    columns: table.columns.map(col => ({ ...col, selected: false })), // Désélectionne toutes les colonnes
    position: { x: 0, y: 0 } // Position par défaut
  };
}


/**
 * Gère le drop d'une table dans la zone de travail
 * @param event Événement de drop
 */
onDropTable(event: CdkDragDrop<DatabaseTable[]>) {
  const droppedTable = event.previousContainer.data[event.previousIndex];
  this.addTableToWorkspace(droppedTable);
}

/**
 * Ajoute une table au double-clic
 * @param table Table à ajouter
 */
addTableOnDoubleClick(table: DatabaseTable) {
  this.addTableToWorkspace(table);
}

/**
 * Méthode commune pour ajouter une table à l'espace de travail
 * @param table Table à ajouter
 */
private addTableToWorkspace(table: DatabaseTable) {
  // Vérifie si la table est déjà sélectionnée
  if (!this.selectedTables.some(t => t.tableName === table.tableName)) {
    const newTable = this.createTableInstance(table);
    this.selectedTables.push(newTable);
    this.afterTableAdded();
  }
}

/**
 * Opérations à effectuer après l'ajout d'une table
 */
private afterTableAdded() {
  this.arrangeTables(); // Réorganise les tables
  this.updateRelationLines(); // Met à jour les relations
  this.adjustDropZoneSize(); // Ajuste la taille de la zone
  this.cdr.detectChanges(); // Déclenche la détection de changements
}

  /**
   * Sélectionne ou désélectionne toutes les colonnes d'une table
   * @param table Table concernée
   * @param event Événement de changement
   */
  toggleAllColumns(table: DatabaseTable, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    table.columns.forEach(column => column.selected = checked);
  }
}