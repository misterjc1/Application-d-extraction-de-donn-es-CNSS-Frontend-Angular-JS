// Importation des modules nécessaires depuis Angular et les modèles personnalisés
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Condition, DatabaseTable, TableColumn } from 'src/app/class/model';

// Interface pour représenter une colonne avec des noms complets et d'affichage
interface Column {
    fullName: string;
    displayName: string;
    tableName: string;
}

// Déclaration du composant Angular
@Component({
    selector: 'app-condition',
    templateUrl: './condition.component.html',
    styleUrls: ['./condition.component.scss']
})
export class ConditionComponent implements OnInit {
    // Liste des tables reçue en entrée
    @Input() tables: DatabaseTable[] = [];

    // Événement émis lorsqu'une condition est ajoutée
    @Output() conditionAdded = new EventEmitter<Condition[]>();

    // Événement émis pour fermer la modale
    @Output() closeModal = new EventEmitter<void>();

    @Input() initialConditions: Condition[] = [];


    // Onglet actif (filtrage ou tri)
    activeTab: 'sort' | 'filter' = 'filter';

    // Nom du filtre
    filterName: string = '';

    // Liste des conditions ajoutées
    conditions: Condition[] = [];

    // Indique si les colonnes doivent être triées alphabétiquement
    alphabetizeColumns: boolean = false;

    // Nom de la table sélectionnée
    selectedTableName: string = '';
    
    // Condition en cours de création
    newCondition: Partial<Condition> = {
        field: '',
        operator: '=',
        value: ''
    };

    // Fonction appelée à l'initialisation du composant
    ngOnInit() {
        // verifier s'il ya des conditions lors de input
        if (this.initialConditions.length > 0) {
            this.conditions = [...this.initialConditions];   // Charge les conditions passées
        }
    }

    // Définit l'onglet actif (filtre ou tri)
    setActiveTab(tab: 'sort' | 'filter') {
        this.activeTab = tab;
    }

    // Réinitialise les champs de la condition lorsque la table change
    onTableSelect() {
        this.newCondition.field = '';
        this.newCondition.value = '';
    }

    // Récupère les colonnes de la table sélectionnée
    getTableColumns(): TableColumn[] {
        if (!this.selectedTableName) return [];
        
        const selectedTable = this.tables.find(table => table.tableName === this.selectedTableName);
        if (!selectedTable) return [];

        let columns = [...selectedTable.columns];
        
        // Trie les colonnes par ordre alphabétique si activé
        if (this.alphabetizeColumns) {
            columns.sort((a, b) => {
                const aName = a.displayName || a.columnName;
                const bName = b.displayName || b.columnName;
                return aName.localeCompare(bName);
            });
        }
        
        return columns;
    }

    // Vérifie si les conditions minimales sont remplies pour ajouter une condition
    canAddCondition(): boolean {
        return !!this.newCondition.field && !!this.newCondition.operator && !!this.selectedTableName;
    }

    // Ajoute une nouvelle condition à la liste
    addCondition() {
        if (!this.canAddCondition()) return;

        const condition: Condition = {
            // Formate le champ avec le nom de la table et de la colonne
            field: `${this.selectedTableName}.${this.newCondition.field!.split('.')[1] || this.newCondition.field}`,
            operator: this.newCondition.operator!,
            value: this.newCondition.value!
        };
        
        this.conditions.push(condition);
        
        // Réinitialise le formulaire de création de condition
        this.newCondition = {
            field: '',
            operator: '=',
            value: ''
        };
    }

    // Supprime une condition à l’index donné
    removeCondition(index: number) {
        this.conditions.splice(index, 1);
    }

    // Génère un texte lisible pour une condition donnée
    getConditionText(condition: Condition): string {
        const [tableName, columnName] = condition.field.split('.');
        const table = this.tables.find(t => t.tableName === tableName);
        const column = table?.columns.find(c => c.columnName === columnName);
        
        const displayColumnName = column?.displayName || columnName;
        const displayTableName = table?.remarks || tableName;
        
        let operatorText = condition.operator;
        // Traduction des opérateurs en texte lisible
        switch (condition.operator) {
            case '=': operatorText = 'égal à'; break;
            case '!=': operatorText = 'différent de'; break;
            case '>': operatorText = 'supérieur à'; break;
            case '<': operatorText = 'inférieur à'; break;
            case '>=': operatorText = 'supérieur ou égal à'; break;
            case '<=': operatorText = 'inférieur ou égal à'; break;
            case 'LIKE': operatorText = 'contient'; break;
        }
        
        return `${displayTableName}.${displayColumnName} ${operatorText} ${condition.value}`;
    }

    // Applique les filtres en émettant la liste des conditions
    // Quand on applique les conditions, on émet les nouvelles conditions
applyFilter() {
    if (this.conditions.length > 0) {
      this.conditionAdded.emit(this.conditions);  // On envoie les conditions au parent
    }
    this.close();  // On ferme la modale
  }
  

    // Vide toutes les conditions
    clearFilter() {
        this.conditions = [];
    }

    // Ferme la modale
    close() {
        this.closeModal.emit();
    }
}
