-- Core schema for ETF recommendation platform
-- Run in MySQL after creating the etf_db database

CREATE TABLE IF NOT EXISTS etfs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price FLOAT,
    price_change FLOAT,
    change_percent VARCHAR(20),
    volume VARCHAR(50),
    UNIQUE KEY uk_etfs_symbol (symbol)
);

CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    risk_level ENUM('low', 'medium', 'high', 'very_high') NOT NULL,
    investment_horizon ENUM('short', 'medium', 'long') NOT NULL,
    allocation_preference ENUM('lt_10', 'btw_10_25', 'btw_25_50', 'gt_50') NOT NULL,
    experience_level ENUM('beginner', 'intermediate', 'advanced', 'professional') NOT NULL,
    stability_focus ENUM('capital_preservation', 'balanced_income', 'growth') NOT NULL,
    max_drawdown_tolerance ENUM('none', 'up_to_5', 'up_to_15', 'above_15') NOT NULL,
    liquidity_need ENUM('immediate', 'months', 'years') NOT NULL,
    sector_preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questionnaire (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    question_text VARCHAR(255) NOT NULL,
    question_type ENUM('single_choice', 'multi_choice', 'scale', 'text') NOT NULL,
    possible_answers JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_payload JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questionnaire(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    etf_id INT NOT NULL,
    score FLOAT NOT NULL,
    rationale TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (etf_id) REFERENCES etfs(id) ON DELETE CASCADE,
    UNIQUE KEY uk_recommendations_client_etf (client_id, etf_id)
);
