# Membre 4 — Demandes et messagerie

Parties : **demande de service**, **suivi des demandes**, **interface de discussion** (temps réel, Firebase).

Le style reprend la palette vert sauge et vert profond de DevMind, avec des cartes plus lisibles, des états de focus accessibles et une mise en page adaptée au téléphone. Le chat utilise une conversation par demande, comme dans les maquettes.

## Fichiers à ajouter au dépôt

| Fichier | Rôle |
|---|---|
| `demande.html` + `js/demandes.js` | Formulaire de demande (validation, envoi dans Firestore) |
| `suivi.html` + `js/suivi.js` | Suivi : « Mes demandes » / « Demandes reçues », filtres, changement de statut |
| `messagerie.html` + `js/messagerie.js` | Chat en temps réel, une conversation par demande |
| `js/m4-common.js` | Connexion Firebase, garde d'authentification, utilitaires |
| `js/firebase-config.js` | Clés Firebase + noms des pages des autres membres (**à remplir**) |
| `css/membre4.css` | Style (variables vert/fond/texte de la plateforme) |
| `firestore.rules` | Règles de sécurité à coller dans Firebase > Firestore > Règles |

## Lien avec les autres membres

- **Annuaire / profil du professionnel** → bouton « Demander un service » :
  `demande.html?pro=<uid du prestataire>&nom=<nom>&cat=<Plomberie>`
- **Connexion (Membre 3)** : si l'utilisateur n'est pas connecté, on le renvoie vers `LOGIN_PAGE`
  (`js/firebase-config.js`) avec `?redirect=`. Pensez à lire ce paramètre après la connexion.
- Le `uid` du prestataire est l'identifiant Firebase Auth de son compte.

## Données Firestore

`demandes/{id}` : `clientId, clientNom, prestataireId, prestataireNom, categorie, titre, description, adresse, dateSouhaitee, urgence, budget, statut, createdAt, updatedAt`
`demandes/{id}/messages/{id}` : `senderId, texte, createdAt`

Statuts : `en_attente → acceptee → en_cours → terminee` (ou `refusee` / `annulee`).

## Tester en local

Les modules JS ne marchent pas en `file://`. Utilisez l'extension **Live Server** de VS Code
ou `python -m http.server`, puis ouvrez `http://localhost:8000/demande.html?pro=TEST&nom=Test&cat=Plomberie`.
Dans Firebase : activez **Authentication** et **Firestore**, puis publiez `firestore.rules`.

Avant d'essayer, remplacez les valeurs `VOTRE_*` dans `js/firebase-config.js` par la configuration de l'application Web Firebase de l'équipe. Vérifiez aussi que `LOGIN_PAGE` et `DIRECTORY_PAGE` correspondent aux fichiers réellement utilisés par les autres membres. Les règles empêchent la création et la modification de demandes par une personne non concernée et contrôlent les transitions de statut.

## Git (travail à 4)

```bash
git checkout -b membre4-demandes-messagerie
git add demande.html suivi.html messagerie.html js/ css/membre4.css firestore.rules README-membre4.md
git commit -m "Membre 4 : demandes, suivi et messagerie"
git push origin membre4-demandes-messagerie
```
Puis ouvrez une Pull Request. Un seul `firebase-config.js` pour toute l'équipe : fusionnez avec celui du Membre 3.
