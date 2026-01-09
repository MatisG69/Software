-- Migration: Ajouter la colonne skills à la table applications
-- Ce script peut être exécuté même si la colonne existe déjà

-- Vérifier et ajouter la colonne skills si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'applications' 
        AND column_name = 'skills'
    ) THEN
        ALTER TABLE applications ADD COLUMN skills TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Colonne skills ajoutée à la table applications';
    ELSE
        RAISE NOTICE 'La colonne skills existe déjà dans la table applications';
    END IF;
END $$;
