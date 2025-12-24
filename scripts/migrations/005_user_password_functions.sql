-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create user with hashed password
CREATE OR REPLACE FUNCTION create_user_with_password(
  p_id TEXT,
  p_username TEXT,
  p_password TEXT,
  p_role TEXT
) RETURNS TABLE (
  id TEXT,
  username TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO users (id, username, password, role)
  VALUES (p_id, p_username, crypt(p_password, gen_salt('bf')), p_role)
  RETURNING users.id, users.username, users.role, users.created_at, users.updated_at;
END;
$$ LANGUAGE plpgsql;

-- Function to update user password
CREATE OR REPLACE FUNCTION update_user_password(
  p_id TEXT,
  p_username TEXT,
  p_password TEXT DEFAULT NULL
) RETURNS TABLE (
  id TEXT,
  username TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  IF p_password IS NOT NULL THEN
    -- Update username and password
    RETURN QUERY
    UPDATE users
    SET 
      username = p_username,
      password = crypt(p_password, gen_salt('bf')),
      updated_at = NOW()
    WHERE users.id = p_id
    RETURNING users.id, users.username, users.role, users.created_at, users.updated_at;
  ELSE
    -- Update only username
    RETURN QUERY
    UPDATE users
    SET 
      username = p_username,
      updated_at = NOW()
    WHERE users.id = p_id
    RETURNING users.id, users.username, users.role, users.created_at, users.updated_at;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to verify user password
CREATE OR REPLACE FUNCTION verify_user_password(
  p_id TEXT,
  p_password TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_password TEXT;
BEGIN
  SELECT password INTO v_password
  FROM users
  WHERE id = p_id;
  
  IF v_password IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN v_password = crypt(p_password, v_password);
END;
$$ LANGUAGE plpgsql;
