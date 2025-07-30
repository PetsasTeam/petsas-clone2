-- Add database indexes for locations table to improve query performance

-- Index for the most common query (visible locations ordered by displayOrder)
CREATE INDEX IF NOT EXISTS "Location_visible_displayOrder_idx" ON "Location" ("visible", "displayOrder");

-- Index for pickup point queries
CREATE INDEX IF NOT EXISTS "Location_isPickupPoint_visible_idx" ON "Location" ("isPickupPoint", "visible");

-- Index for dropoff point queries  
CREATE INDEX IF NOT EXISTS "Location_isDropoffPoint_visible_idx" ON "Location" ("isDropoffPoint", "visible");

-- Composite index for the exact query used in homepage
CREATE INDEX IF NOT EXISTS "Location_homepage_query_idx" ON "Location" ("visible", "displayOrder", "id", "name", "type");