-- ===========================================
-- Piyo Web — Supabase Schema (v2)
-- ===========================================
-- 인증: NextAuth v5가 담당 (Supabase Auth 미사용)
-- RLS: 미사용 — API Route (service_role)에서 접근 제어
-- ===========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (NextAuth에서 upsert)
CREATE TABLE IF NOT EXISTS piyo_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT UNIQUE NOT NULL, -- NextAuth user.id
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  provider TEXT CHECK (provider IN ('kakao', 'google', 'apple')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consent records
CREATE TABLE IF NOT EXISTS piyo_consent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES piyo_users(id) ON DELETE SET NULL,
  anonymous_id TEXT, -- sessionStorage UUID
  privacy_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  data_collection_agreed BOOLEAN NOT NULL DEFAULT FALSE,
  agreed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET
);
CREATE INDEX idx_piyo_consent_anon ON piyo_consent(anonymous_id);

-- Survey data
CREATE TABLE IF NOT EXISTS piyo_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES piyo_users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female')),
  skin_type TEXT CHECK (skin_type IN ('oily', 'dry', 'combination', 'sensitive', 'normal')),
  concerns TEXT[] DEFAULT '{}',
  skin_sensitivity INTEGER CHECK (skin_sensitivity BETWEEN 1 AND 5),
  skin_intensity INTEGER CHECK (skin_intensity BETWEEN 1 AND 5),
  is_pregnant BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE IF NOT EXISTS piyo_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES piyo_users(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  title TEXT NOT NULL DEFAULT '새 대화',
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_piyo_sessions_user ON piyo_sessions(user_id);
CREATE INDEX idx_piyo_sessions_anon ON piyo_sessions(anonymous_id);
CREATE INDEX idx_piyo_sessions_updated ON piyo_sessions(updated_at DESC);

-- Chat messages
CREATE TABLE IF NOT EXISTS piyo_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES piyo_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_piyo_messages_session ON piyo_messages(session_id);

-- Auto-update session on new message
CREATE OR REPLACE FUNCTION piyo_update_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE piyo_sessions SET
    message_count = message_count + 1,
    updated_at = NOW(),
    title = CASE
      WHEN message_count = 0 AND NEW.role = 'user' THEN LEFT(NEW.content, 50)
      ELSE title
    END
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_piyo_message_insert
  AFTER INSERT ON piyo_messages
  FOR EACH ROW EXECUTE FUNCTION piyo_update_session_on_message();

-- Merge anonymous → logged-in user
CREATE OR REPLACE FUNCTION piyo_merge_anonymous(
  p_user_id UUID,
  p_anonymous_id TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE piyo_sessions SET user_id = p_user_id, anonymous_id = NULL
    WHERE anonymous_id = p_anonymous_id AND user_id IS NULL;
  UPDATE piyo_surveys SET user_id = p_user_id, anonymous_id = NULL
    WHERE anonymous_id = p_anonymous_id AND user_id IS NULL;
  UPDATE piyo_consent SET user_id = p_user_id, anonymous_id = NULL
    WHERE anonymous_id = p_anonymous_id AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
