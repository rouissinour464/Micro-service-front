# Tests Frontend — Stage Service

## Structure des tests

```
src/
├── __mocks__/
│   └── stageService.js          # Mock complet (jest.fn) de toutes les fonctions
├── __tests__/
│   ├── unit/
│   │   ├── stageService.test.js          # 22 tests unitaires — vérifie chaque endpoint
│   │   ├── EtudiantDashboard.test.jsx    # 16 tests unitaires — rendu + interactions
│   │   └── EncadrantDashboard.test.jsx   # 12 tests unitaires — rendu + commentaires
│   └── integration/
│       ├── EtudiantFlow.integration.test.jsx   # 18 tests — parcours complet étudiant
│       ├── AdminStageFlow.integration.test.jsx # 14 tests — offres + validation + soutenance
│       └── EncadrantFlow.integration.test.jsx  # 16 tests — livrables + commentaires
```

## Lancer les tests

```bash
# Installer les dépendances
npm install

# Lancer tous les tests
npm test

# Avec couverture de code
npm run test:coverage
```

## Tests Unitaires

### `stageService.test.js`
Vérifie que chaque fonction du service appelle le bon endpoint HTTP :
- `getOffresActives()` → `GET /offres`
- `createOffre(data)` → `POST /offres` avec payload
- `validerDemande(id, data)` → `PATCH /demandes/:id/validation`
- `choisirEncadrant(id, encId)` → `PATCH /demandes/:id/encadrant`
- `deposerLivrable(formData)` → `POST /livrables` multipart
- `commenterLivrable(data)` → `POST /commentaires`
- `planifierSoutenance(data)` → `POST /soutenances`
- ... (22 tests au total)

### `EtudiantDashboard.test.jsx`
- Rendu initial avec prénom utilisateur
- Navigation entre les 4 onglets
- Affichage des offres, demandes, livrables, soutenance
- Soumission d'une demande (succès + erreur)
- Bouton encadrant conditionnel
- Chargement des commentaires

### `EncadrantDashboard.test.jsx`
- Rendu initial avec prénom encadrant
- Navigation entre les 3 onglets
- Affichage des encadrements et livrables
- Formulaire commentaire (ouvrir, soumettre, annuler)
- Gestion des erreurs (succès/échec)

## Tests d'Intégration

### `EtudiantFlow.integration.test.jsx`
Simule le parcours complet d'un étudiant :
1. **Consulter les offres** — affichage, description, entreprise
2. **Soumettre une demande** — avec lettre de motivation
3. **Voir le statut** — EN_ATTENTE, VALIDEE, badge coloré
4. **Choisir un encadrant** — dropdown, confirmation
5. **Déposer un livrable** — upload FormData
6. **Consulter la soutenance** — date, lieu, salle

### `AdminStageFlow.integration.test.jsx`
Simule le travail de l'admin :
1. **Créer/modifier des offres** — formulaire complet
2. **Activer/désactiver** une offre
3. **Valider/Rejeter** une demande + prompt motif
4. **Planifier** une soutenance
5. **Supprimer** une soutenance

### `EncadrantFlow.integration.test.jsx`
Simule le travail de l'encadrant :
1. **Voir ses encadrements** — étudiant, date validation
2. **Consulter les livrables** — type, taille, date
3. **Commenter** un livrable précis (id vérifié)
4. **Annuler** un commentaire sans soumettre
5. **Voir les soutenances** — date fr-FR, salle, observations

## Variables d'environnement

```env
REACT_APP_API_URL=http://localhost:30080/api        # auth-service (port 8081 via gateway)
REACT_APP_STAGE_API_URL=http://localhost:8082/api   # stage-service (port 8082)
```
