-- Add sample knowledge post
INSERT INTO collaboration_posts (
  id,
  board_id,
  title,
  content,
  author,
  created_at,
  updated_at,
  files
) VALUES (
  gen_random_uuid(),
  'KNOWLEDGE',
  '풍력 터빈 성능 최적화 연구',
  '본 연구는 풍력 터빈의 효율성을 극대화하기 위한 다양한 최적화 기법을 다룹니다.

주요 내용:
1. 블레이드 설계 최적화
2. 제어 알고리즘 개선
3. 유지보수 전략 수립
4. 실시간 모니터링 시스템

연구 결과, 최적화된 제어 알고리즘을 적용한 결과 평균 15%의 발전 효율 향상을 달성했습니다. 또한 예측 유지보수 시스템을 통해 다운타임을 30% 감소시킬 수 있었습니다.

이 연구는 향후 대규모 풍력 발전 단지의 운영 효율성 개선에 중요한 기여를 할 것으로 기대됩니다.',
  '연구팀',
  NOW(),
  NOW(),
  '[]'::jsonb
);
