# Configuration Supabase Edge Function pour Anthropic

## 1. Installer Supabase CLI

```bash
npm install -g supabase
```

## 2. Se connecter à Supabase

```bash
supabase login
```

## 3. Lier le projet

```bash
supabase link --project-ref votre-project-ref
```

## 4. Déployer la fonction Edge

```bash
supabase functions deploy anthropic-proxy
```

## 5. Configurer la variable d'environnement

Dans le dashboard Supabase :
- Allez dans Project Settings > Edge Functions
- Ajoutez la variable d'environnement : `ANTHROPIC_API_KEY` avec votre clé API

## Alternative : Utiliser directement depuis le client (non recommandé)

Si vous ne pouvez pas utiliser Supabase Edge Functions, vous pouvez créer un petit serveur proxy Express ou utiliser un service comme Vercel Edge Functions.

