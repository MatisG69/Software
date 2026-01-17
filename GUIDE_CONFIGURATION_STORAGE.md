# 📋 Guide de Configuration - Supabase Storage pour les Médias d'Offres

## Problème
L'erreur "new row violates row-level security policy" indique que les politiques RLS (Row Level Security) ne sont pas configurées pour le bucket `job-media`.

## Solution : Configuration via l'Interface Supabase

### Étape 1 : Vérifier le bucket
1. Allez dans **Supabase Dashboard** → **Storage**
2. Vérifiez que le bucket `job-media` existe
3. Cliquez sur le bucket `job-media`

### Étape 2 : Configurer le bucket comme public
1. Dans les paramètres du bucket, cochez **"Public bucket"**
2. Cela permet la lecture publique des fichiers

### Étape 3 : Configurer les politiques RLS
1. Dans le bucket `job-media`, allez dans l'onglet **"Policies"**
2. Cliquez sur **"New Policy"**

#### Politique 1 : Upload (INSERT) - Pour les entreprises authentifiées
- **Policy name**: `Allow authenticated upload`
- **Allowed operation**: `INSERT`
- **Policy definition** (copier-coller):
  ```sql
  (bucket_id = 'job-media') AND (auth.role() = 'authenticated')
  ```
- **Check expression** (copier-coller):
  ```sql
  (bucket_id = 'job-media') AND (auth.role() = 'authenticated')
  ```
- Cliquez sur **"Review"** puis **"Save policy"**

#### Politique 2 : Lecture publique (SELECT) - Pour tous
- **Policy name**: `Allow public read`
- **Allowed operation**: `SELECT`
- **Policy definition** (copier-coller):
  ```sql
  (bucket_id = 'job-media')
  ```
- **Check expression** (copier-coller):
  ```sql
  (bucket_id = 'job-media')
  ```
- Cliquez sur **"Review"** puis **"Save policy"**

#### Politique 3 : Mise à jour (UPDATE) - Pour les entreprises authentifiées
- **Policy name**: `Allow authenticated update`
- **Allowed operation**: `UPDATE`
- **Policy definition** (copier-coller):
  ```sql
  (bucket_id = 'job-media') AND (auth.role() = 'authenticated')
  ```
- **Check expression** (copier-coller):
  ```sql
  (bucket_id = 'job-media') AND (auth.role() = 'authenticated')
  ```
- Cliquez sur **"Review"** puis **"Save policy"**

#### Politique 4 : Suppression (DELETE) - Pour les entreprises authentifiées
- **Policy name**: `Allow authenticated delete`
- **Allowed operation**: `DELETE`
- **Policy definition** (copier-coller):
  ```sql
  (bucket_id = 'job-media') AND (auth.role() = 'authenticated')
  ```
- **Check expression** (copier-coller):
  ```sql
  (bucket_id = 'job-media') AND (auth.role() = 'authenticated')
  ```
- Cliquez sur **"Review"** puis **"Save policy"**

## 📝 Résumé des 4 politiques à créer

| Politique | Opération | Qui peut faire | Expression |
|-----------|----------|----------------|------------|
| Allow authenticated upload | INSERT | Utilisateurs authentifiés | `(bucket_id = 'job-media') AND (auth.role() = 'authenticated')` |
| Allow public read | SELECT | Tout le monde | `(bucket_id = 'job-media')` |
| Allow authenticated update | UPDATE | Utilisateurs authentifiés | `(bucket_id = 'job-media') AND (auth.role() = 'authenticated')` |
| Allow authenticated delete | DELETE | Utilisateurs authentifiés | `(bucket_id = 'job-media') AND (auth.role() = 'authenticated')` |

### Étape 4 : Vérification
1. Après avoir créé les 4 politiques, testez l'upload dans votre application
2. Les fichiers devraient maintenant s'uploader sans erreur RLS

## Alternative : Configuration via SQL (si vous avez accès à la base de données)

Si vous avez accès direct à la base de données PostgreSQL de Supabase, vous pouvez utiliser cette requête pour créer les politiques :

```sql
-- Note: Cette méthode nécessite un accès direct à la base de données PostgreSQL
-- et peut ne pas fonctionner selon votre configuration Supabase

-- Créer les politiques via la table storage.objects
-- (Cette méthode est plus complexe et nécessite des permissions spéciales)
```

**Recommandation** : Utilisez l'interface Supabase Dashboard, c'est plus simple et plus sûr.

## Dépannage

### Si l'upload échoue toujours :
1. Vérifiez que vous êtes bien connecté en tant qu'entreprise (authentifié)
2. Vérifiez que le bucket est bien public
3. Vérifiez que les 4 politiques sont bien créées
4. Vérifiez les logs dans la console du navigateur pour plus de détails

### Si vous voyez toujours "row-level security policy" :
- Les politiques ne sont peut-être pas activées correctement
- Essayez de supprimer et recréer les politiques
- Vérifiez que RLS est activé sur le bucket

## Solution temporaire : URLs directes

En attendant la configuration, vous pouvez utiliser les champs "URL de l'image" et "URL de la vidéo" dans le formulaire de création d'offre pour ajouter des médias via des URLs externes.
