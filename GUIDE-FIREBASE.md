# Activer la connexion Google (Firebase)

## 1. Créer le projet
1. Va sur https://console.firebase.google.com et connecte-toi avec un compte Google.
2. **Ajouter un projet** → donne un nom (ex. `service-plateforme`) → tu peux désactiver Google Analytics → **Créer**.

## 2. Activer Google comme méthode de connexion
1. Menu de gauche : **Build → Authentication** → **Commencer**.
2. Onglet **Sign-in method** → **Google** → **Activer**.
3. Choisis une adresse e-mail d'assistance (la tienne) → **Enregistrer**.

## 3. Récupérer la configuration
1. Roue dentée ⚙ → **Paramètres du projet**.
2. Section **Vos applications** → icône **Web `</>`** → donne un surnom → **Enregistrer l'application**.
3. Copie les valeurs `apiKey`, `authDomain`, `projectId`, `appId`.
4. Colle-les dans `js/firebase-config.js` à la place des `COLLER_ICI`.

## 4. Autoriser le domaine du site
**Authentication → Paramètres → Domaines autorisés** → **Ajouter un domaine** :
- `localhost` est déjà autorisé (pour tester).
- Si le site est publié avec GitHub Pages, ajoute `lawsondev1805777.github.io`.

## 5. Tester en local
Le site doit être ouvert via un serveur, pas en double-cliquant sur le fichier (les modules JS sont bloqués en `file://`) :

```bash
cd dossier-du-projet
python3 -m http.server 8000
```
Puis ouvre http://localhost:8000/connexion.html et clique sur **Continuer avec Google**.

## Remarques
- Les valeurs de `firebase-config.js` ne sont pas secrètes : tu peux les envoyer sur GitHub.
- Pour l'instant, le compte est enregistré dans le navigateur (comme le reste de la démo). Quand le backend existera, le jeton Firebase (`user.getIdToken()`) servira à prouver l'identité auprès de l'API.
- Apple viendra dans un second temps (compte Apple Developer payant requis).
