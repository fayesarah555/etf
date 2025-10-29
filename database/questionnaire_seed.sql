-- Seed data for the client profiling questionnaire
-- Run after loading schema.sql

INSERT INTO questionnaire (code, question_text, question_type, possible_answers) VALUES
('risk_tolerance', 'Quelle est votre tolerance au risque ?', 'single_choice', JSON_ARRAY('Faible', 'Moderee', 'Elevee', 'Tres elevee')),
('investment_horizon', 'Quel est votre horizon d''investissement principal ?', 'single_choice', JSON_ARRAY('Court terme (<2 ans)', 'Moyen terme (2-5 ans)', 'Long terme (>5 ans)')),
('allocation_preference', 'Quelle proportion de votre patrimoine souhaitez-vous investir en ETF ?', 'single_choice', JSON_ARRAY('<10 %', '10-25 %', '25-50 %', '>50 %')),
('experience_level', 'Quelle est votre experience des placements financiers ?', 'single_choice', JSON_ARRAY('Debutant', 'Intermediaire', 'Avance', 'Professionnel')),
('stability_focus', 'Quelle stabilite de rendement recherchez-vous ?', 'single_choice', JSON_ARRAY('Capital garanti', 'Rendement modere et regulier', 'Rendement potentiel eleve avec volatilite')),
('drawdown_tolerance', 'Jusqu''a quelle perte a court terme etes-vous pret a aller ?', 'single_choice', JSON_ARRAY('Aucune', 'Jusqu''a 5 %', 'Jusqu''a 15 %', 'Plus de 15 %')),
('sector_preferences', 'Dans quels secteurs souhaitez-vous investir ?', 'multi_choice', JSON_ARRAY('Technologie', 'Sante', 'Energie', 'Financier', 'Industrial', 'Consommation', 'Sans preference')),
('liquidity_need', 'Quel est votre besoin de liquidite ?', 'single_choice', JSON_ARRAY('Acces immediat', 'Acces en quelques mois', 'Pas de besoin avant plusieurs annees'));
