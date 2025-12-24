-- 협업 게시판 테이블 생성
CREATE TABLE IF NOT EXISTS collaboration_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  board_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_collaboration_posts_board_id ON collaboration_posts(board_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_posts_created_at ON collaboration_posts(created_at DESC);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS update_collaboration_posts_updated_at ON collaboration_posts;
CREATE TRIGGER update_collaboration_posts_updated_at
  BEFORE UPDATE ON collaboration_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
