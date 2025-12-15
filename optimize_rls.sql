-- Optimize RLS policy for 'items' table
-- Problem: 'auth.uid() = user_id' evaluates for every row
-- Solution: '(select auth.uid()) = user_id' evaluates once per query

DROP POLICY IF EXISTS "Users can only access their own items" ON items;

CREATE POLICY "Users can only access their own items"
ON items
FOR ALL
USING (
  (select auth.uid()) = user_id
);
