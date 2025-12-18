-- Allow public to see available items
create policy "Allow public to view in_stock items"
on items for select
to public
using (status = 'in_stock');

-- Also allow "reserved" for show (optional, but good for "Sold" badging logic if showing recent sales? Or just in_stock)
-- Let's stick to in_stock for now, or maybe status IN ('in_stock', 'reserved', 'sold') if we want to show a "Sold" gallery.
-- Plan says: "filtert alles außer in_stock".
