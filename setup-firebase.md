# Configuration Firebase pour le projet

## Étapes pour résoudre le problème de création d'utilisateur

### 1. Installer Firebase CLI (si pas déjà installé)
```bash
npm install -g firebase-tools
```

### 2. Se connecter à Firebase
```bash
firebase login
```

### 3. Déployer les règles Firestore
```bash
npm run firebase:deploy:rules
```

### 4. Déployer les indexes Firestore (optionnel)
```bash
npm run firebase:deploy:indexes
```

## Vérification

Après avoir déployé les règles, testez la création d'un compte :

1. Ouvrez la console de votre navigateur (F12)
2. Allez sur la page d'inscription
3. Créez un nouveau compte
4. Vérifiez les logs dans la console pour voir les messages de debug

## Problèmes courants

### Si vous obtenez une erreur "Permission denied"
- Vérifiez que vous êtes connecté à Firebase CLI
- Vérifiez que le projet ID dans `.firebaserc` correspond à votre projet Firebase
- Vérifiez que vous avez les permissions d'administrateur sur le projet

### Si les règles ne se déploient pas
- Vérifiez que le fichier `firestore.rules` existe
- Vérifiez la syntaxe des règles
- Essayez de redéployer avec `firebase deploy --only firestore:rules`

## Structure des règles

Les règles créées permettent :
- La création de documents utilisateurs par des utilisateurs authentifiés
- La lecture/écriture de documents utilisateurs par leur propriétaire
- La création d'événements analytics par des utilisateurs authentifiés
- Le refus de tout autre accès non autorisé 