
-- SINGLE RPC to fetch EVERYTHING needed for the dashboard visuals
-- Returns a JSON object with all the structures needed by the UI

CREATE OR REPLACE FUNCTION get_detailed_dashboard_stats(org_id UUID, filter_timeframe TEXT)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  start_date TIMESTAMP;
  result JSON;
BEGIN
  -- Determine start date
  IF filter_timeframe = 'month' THEN
    start_date := date_trunc('month', now());
  ELSIF filter_timeframe = '3months' THEN
    start_date := now() - interval '3 months';
  ELSE
    start_date := NULL; -- All time
  END IF;

  WITH 
  -- 1. Base Filtered Sold Items (for Revenue, Profit, Margin, Channels, Brands)
  sold_items AS (
    SELECT 
      sale_price_eur,
      purchase_price_eur,
      COALESCE(platform_fees_eur, 0) as fees,
      COALESCE(shipping_cost_eur, 0) as shipping,
      sale_channel,
      brand,
      sale_date
    FROM items
    WHERE organization_id = org_id
      AND status = 'sold'
      AND (start_date IS NULL OR (sale_date IS NOT NULL AND sale_date::date >= start_date::date))
  ),

  -- 2. Base In-Stock Items (for Inventory Value, only active status)
  -- NOTE: Inventory Value usually ignores timeframe filter (Current Value), but user might want 'Inventory added this month'? 
  -- Standard practice: Inventory Value = Current Snapshot. Dashboard usually shows CURRENT stock.
  -- So we do NOT filter by start_date for stock count/value.
  stock_items AS (
    SELECT 
      purchase_price_eur
    FROM items
    WHERE organization_id = org_id
      AND (status = 'in_stock' OR status = 'reserved')
  ),

  -- 3. Aggregates
  general_stats AS (
    SELECT
      count(*) as sold_count,
      COALESCE(SUM(sale_price_eur), 0) as total_revenue,
      COALESCE(SUM(sale_price_eur - purchase_price_eur - fees - shipping), 0) as total_profit
    FROM sold_items
  ),

  inv_stats AS (
    SELECT
      count(*) as stock_count,
      COALESCE(SUM(purchase_price_eur), 0) as inventory_value
    FROM stock_items
  ),

  -- 4. Brands Stats (Group by Brand)
  brand_stats AS (
    SELECT
      brand,
      count(*) as count,
      COALESCE(SUM(sale_price_eur), 0) as revenue,
      COALESCE(SUM(sale_price_eur - purchase_price_eur - fees - shipping), 0) as profit
    FROM sold_items
    GROUP BY brand
  ),
  
  -- Top Brands List (by Profit)
  top_brands_list AS (
    SELECT 
      brand,
      revenue,
      profit,
      count
    FROM brand_stats
    ORDER BY profit DESC
    LIMIT 10
  ),

  -- Best Margin Brand (Single)
  best_margin_brand AS (
    SELECT 
      brand,
      revenue,
      profit
    FROM brand_stats
    WHERE revenue > 0
    ORDER BY (profit / revenue) DESC
    LIMIT 1
  ),

  -- Highest Profit Brand (Single)
  highest_profit_brand AS (
    SELECT 
      brand,
      revenue,
      profit
    FROM brand_stats
    ORDER BY profit DESC
    LIMIT 1
  ),

  -- 5. Channels Stats
  channel_stats_list AS (
    SELECT
      sale_channel as channel,
      count(*) as count,
      COALESCE(SUM(sale_price_eur), 0) as revenue,
      COALESCE(SUM(sale_price_eur - purchase_price_eur - fees - shipping), 0) as profit
    FROM sold_items
    GROUP BY sale_channel
    ORDER BY profit DESC
  )

  SELECT json_build_object(
    'totalProfit', (SELECT total_profit FROM general_stats),
    'totalRevenue', (SELECT total_revenue FROM general_stats),
    'totalSales', (SELECT sold_count FROM general_stats),
    'averageMargin', (SELECT CASE WHEN total_revenue > 0 THEN (total_profit / total_revenue) * 100 ELSE 0 END FROM general_stats),
    
    'inventoryValue', (SELECT inventory_value FROM inv_stats),
    'stockCount', (SELECT stock_count FROM inv_stats),
    
    'channels', (SELECT COALESCE(json_agg(channel_stats_list), '[]'::json) FROM channel_stats_list),
    'topBrands', (SELECT COALESCE(json_agg(top_brands_list), '[]'::json) FROM top_brands_list),
    
    'bestMarginBrand', (SELECT row_to_json(best_margin_brand) FROM best_margin_brand),
    'highestProfitBrand', (SELECT row_to_json(highest_profit_brand) FROM highest_profit_brand)
  ) INTO result;

  RETURN result;
END;
$$;
