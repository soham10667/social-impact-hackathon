-- PrepPilot AI PostgreSQL Schema (Supabase)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL, -- Links to auth.users
    full_name VARCHAR(255) NOT NULL,
    college_name VARCHAR(255),
    education_level VARCHAR(100),
    graduation_year INT,
    target_job_role VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(50) DEFAULT 'python',
    known_technologies TEXT[],
    current_preparation_level VARCHAR(50) DEFAULT 'intermediate',
    placement_goal VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Skills Knowledge Graph
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_prerequisites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    prerequisite_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE(skill_id, prerequisite_id)
);

CREATE TABLE IF NOT EXISTS student_skill_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    mastery_status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'needs_improvement', 'in_progress', 'mastered'
    score_percentage NUMERIC(5,2) DEFAULT 0.0,
    evidence_count INT DEFAULT 0,
    last_assessed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(student_id, skill_id)
);

-- 3. AI Mock Interviews
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    job_role VARCHAR(100) NOT NULL,
    topics TEXT[] NOT NULL,
    difficulty VARCHAR(50) NOT NULL, -- 'easy', 'medium', 'hard'
    duration_minutes INT NOT NULL,
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    overall_score NUMERIC(5,2),
    feedback_summary TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS interview_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(50) NOT NULL, -- 'ai', 'student'
    content TEXT NOT NULL,
    question_type VARCHAR(50), -- 'conceptual', 'coding', 'followup', 'system_design'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interview_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    message_id UUID REFERENCES interview_messages(id) ON DELETE CASCADE,
    correctness_score NUMERIC(5,2),
    clarity_score NUMERIC(5,2),
    depth_score NUMERIC(5,2),
    feedback TEXT,
    identified_mistakes JSONB
);

-- 4. Bug Investigation Arena
CREATE TABLE IF NOT EXISTS bug_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    broken_code TEXT NOT NULL,
    error_log TEXT,
    language VARCHAR(50) NOT NULL,
    test_cases JSONB NOT NULL,
    hints TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bug_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES bug_scenarios(id) ON DELETE CASCADE,
    submitted_code TEXT NOT NULL,
    passed_tests INT NOT NULL,
    total_tests INT NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'passed', 'failed'
    attempts_count INT DEFAULT 1,
    time_taken_seconds INT,
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coding_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- auth.users or student_profiles
    problem_slug VARCHAR(100) NOT NULL,
    language VARCHAR(50) NOT NULL,
    source_code TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'passed', 'failed', 'compilation_error'
    passed_tests INT DEFAULT 0,
    total_tests INT DEFAULT 0,
    score NUMERIC(5,2) DEFAULT 0.0,
    execution_time_ms INT DEFAULT 0,
    stdout TEXT,
    stderr TEXT,
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AI Mistake Pattern Detector
CREATE TABLE IF NOT EXISTS mistake_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL, -- 'interview', 'coding', 'bug_arena', 'crisis_simulator', 'assessment'
    source_id UUID NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'syntax', 'conceptual', 'complexity', 'logic', 'edge_case', etc.
    skill_slug VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    code_snippet TEXT,
    severity VARCHAR(50) DEFAULT 'medium',
    disputed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mistake_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    skill_slug VARCHAR(100) NOT NULL,
    pattern_name VARCHAR(255) NOT NULL,
    frequency INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'improving', 'resolved'
    first_detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Interview Time Machine
CREATE TABLE IF NOT EXISTS interview_retries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    original_session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    original_message_id UUID REFERENCES interview_messages(id) ON DELETE CASCADE,
    previous_answer TEXT NOT NULL,
    new_answer TEXT NOT NULL,
    previous_score NUMERIC(5,2),
    new_score NUMERIC(5,2),
    ai_comparison_analysis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. AI Technical Crisis Simulator
CREATE TABLE IF NOT EXISTS crisis_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- 'P0', 'P1', 'P2'
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    initial_metrics JSONB NOT NULL,
    initial_logs TEXT NOT NULL,
    predefined_state_machine JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crisis_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES crisis_scenarios(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'resolved', 'failed'
    current_state VARCHAR(100) NOT NULL,
    timeline JSONB DEFAULT '[]'::jsonb,
    score NUMERIC(5,2),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- 8. Personalized Learning Roadmaps
CREATE TABLE IF NOT EXISTS learning_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    duration_days INT NOT NULL, -- 7, 15, 30
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roadmap_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_id UUID REFERENCES learning_roadmaps(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    task_type VARCHAR(50) NOT NULL, -- 'study', 'interview', 'coding', 'bug_investigation', 'crisis'
    resource_url TEXT,
    completed BOOLEAN DEFAULT FALSE,
    skill_slug VARCHAR(100)
);

-- 9. Resumes & Assessments
CREATE TABLE IF NOT EXISTS resume_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    extracted_text TEXT,
    parsed_skills TEXT[],
    parsed_projects JSONB,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Adaptive Examination Tracking
CREATE TABLE IF NOT EXISTS assessment_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    category_slug VARCHAR(100) NOT NULL,
    current_difficulty VARCHAR(50) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'in_progress',
    total_questions INT DEFAULT 15,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS assessment_asked_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    question_id VARCHAR(255) NOT NULL,
    question_text TEXT NOT NULL,
    normalized_fingerprint VARCHAR(255) NOT NULL,
    concept VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    question_order INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assessment_id, question_id),
    UNIQUE(assessment_id, normalized_fingerprint)
);

