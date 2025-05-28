import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConstruireRequeteComponent } from './components/construire-requete/construire-requete/construire-requete.component';

const routes: Routes = [
  { path: '', redirectTo: '/query-builder', pathMatch: 'full' }, // Redirection vers le Query Builder par défaut
  { path: 'query-builder', component: ConstruireRequeteComponent },   // Route vers le générateur de requêtes
  { path: '**', redirectTo: '/query-builder' }                   // Gestion des routes inconnues
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { 

}
