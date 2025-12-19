CREATE OR REPLACE FUNCTION get_dashboard_summary(org_id UUID, filter_timeframe TEXT)
RETURNS TABLE (
  "totalProfit" NUMERIC,
  "totalRevenue" NUMERIC,
  "totalSales" BIGINT,
  "averageMargin" NUMERIC,
  "totalBrands" BIGINT,
  "totalChannels" BIGINT
) AS $$
DECLARE
  start_date TIMESTAMP;
BEGIN
  -- Determine start date based on timeframe
  IF filter_timeframe = 'month' THEN
    start_date := date_trunc('month', now());
  ELSIF filter_timeframe = '3months' THEN
    start_date := date_trunc('month', now()) - interval '2 months'; -- Current month + 2 previous = 3 months window? Or just literally 3 months ago? JS did 3 months ago. Let's do 3 months interval.
    start_date := now() - interval '3 months';
  ELSE
    start_date := NULL; -- All time
  END IF;

  RETURN QUERY
  WITH sold_items AS (
    SELECT 
      sale_price_eur,
      purchase_price_eur,
      sale_channel,
      brand,
      COALESCE(platform_fees_eur, 0) as fees,
      COALESCE(shipping_cost_eur, 0) as shipping
    FROM items
    WHERE organization_id = org_id
      AND status = 'sold'
      AND (
        start_date IS NULL 
        OR 
        (sale_date IS NOT NULL AND sale_date::date >= start_date::date)
      )
  ),
  aggregated AS (
    SELECT
      COALESCE(SUM(sale_price_eur - purchase_price_eur - fees - shipping), 0) as profit,
      COALESCE(SUM(sale_price_eur), 0) as revenue,
      COUNT(*) as count,
      COUNT(DISTINCT brand) as distinct_brands,
      COUNT(DISTINCT sale_channel) as distinct_channels
    FROM sold_items
  )
  SELECT
    profit as "totalProfit",
    revenue as "totalRevenue",
    count as "totalSales",
    CASE WHEN revenue > 0 THEN (profit / revenue) * 100 ELSE 0 END as "averageMargin",
    distinct_brands as "totalBrands",
    distinct_channels as "totalChannels"
  FROM aggregated;
END;
$$ LANGUAGE plpgsql;
