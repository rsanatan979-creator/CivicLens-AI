-- =========================================================================
-- CIVICLENS AI POSTGRESQL INITIALIZATION & SCHEMA SCRIPT
-- =========================================================================

-- 1. Create custom Enum types if they do not exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
        CREATE TYPE role_enum AS ENUM ('CITIZEN', 'OFFICIAL', 'ADMIN');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'severity_enum') THEN
        CREATE TYPE severity_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_enum') THEN
        CREATE TYPE status_enum AS ENUM ('PENDING', 'INVESTIGATING', 'QUEUED', 'SCHEDULED', 'IN_PROGRESS', 'RESOLVED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vote_enum') THEN
        CREATE TYPE vote_enum AS ENUM ('valid', 'duplicate', 'resolved');
    END IF;
END $$;

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    uid VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'CITIZEN' NOT NULL,
    points INTEGER DEFAULT 100 NOT NULL,
    joined_at VARCHAR(100) NOT NULL,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' NOT NULL,
    password_hash TEXT
);

-- 3. Create Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- 4. Create Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    severity VARCHAR(50) DEFAULT 'MEDIUM' NOT NULL,
    image_url TEXT NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    citizen_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE NOT NULL,
    assigned_dept VARCHAR(255) NOT NULL,
    ai_confidence DOUBLE PRECISION DEFAULT 0.85 NOT NULL,
    upvotes INTEGER DEFAULT 0 NOT NULL,
    reported_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Create Verifications Table
CREATE TABLE IF NOT EXISTS verifications (
    id VARCHAR(255) PRIMARY KEY,
    complaint_id VARCHAR(255) REFERENCES complaints(id) ON DELETE CASCADE NOT NULL,
    citizen_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE NOT NULL,
    vote_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_complaint_citizen UNIQUE (complaint_id, citizen_id)
);

-- 6. Create Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id VARCHAR(255) PRIMARY KEY,
    area_name VARCHAR(255) NOT NULL,
    risk_score DOUBLE PRECISION NOT NULL,
    predicted_issue TEXT NOT NULL
);

-- 7. Create System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
    id VARCHAR(255) PRIMARY KEY,
    text TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    timestamp VARCHAR(100) NOT NULL
);

-- =========================================================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_verifications_complaint ON verifications(complaint_id);

-- =========================================================================
-- INITIAL SEED DATA
-- =========================================================================
INSERT INTO departments (id, name) VALUES 
('dept-1', 'Roads'),
('dept-2', 'Electrical'),
('dept-3', 'Sanitation'),
('dept-4', 'Parks & Rec'),
('dept-5', 'Water Resources')
ON CONFLICT (id) DO NOTHING;

INSERT INTO predictions (id, area_name, risk_score, predicted_issue) VALUES
('p-1', 'Sector 4 (Downtown Grid)', 88.5, 'Pothole density build-up'),
('p-2', 'Sector 12 (Waterfront Area)', 74.2, 'Drainage blocks & flood risk'),
('p-3', 'Sector 7 (Eastside Crossing)', 61.8, 'Streetlight outages')
ON CONFLICT (id) DO NOTHING;

INSERT INTO system_logs (id, text, type, timestamp) VALUES
('l-init-1', '[SYS] CivicLens AI Unified Express Engine initialized', 'SYS', '12:00:00 PM'),
('l-init-2', '[DB] Database script initialized successfully', 'DB', '12:00:00 PM')
ON CONFLICT (id) DO NOTHING;
