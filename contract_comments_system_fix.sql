-- DarRent - Contract Comments System Fix
-- This file ensures the contract_comments table has all required columns

-- ==========================================
-- Check and fix contract_comments table structure
-- ==========================================

-- First check if the table exists
DO $$
BEGIN
    -- If the contract_comments table exists but doesn't have certain columns, add them
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contract_comments') THEN
        -- Add is_issue column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'contract_comments' AND column_name = 'is_issue') THEN
            ALTER TABLE contract_comments ADD COLUMN is_issue BOOLEAN DEFAULT FALSE;
        END IF;
        
        -- Add issue_priority column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'contract_comments' AND column_name = 'issue_priority') THEN
            ALTER TABLE contract_comments ADD COLUMN issue_priority TEXT;
        END IF;
        
        -- Add issue_category column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'contract_comments' AND column_name = 'issue_category') THEN
            ALTER TABLE contract_comments ADD COLUMN issue_category TEXT;
        END IF;
        
        -- Add issue_resolved column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'contract_comments' AND column_name = 'issue_resolved') THEN
            ALTER TABLE contract_comments ADD COLUMN issue_resolved BOOLEAN DEFAULT FALSE;
        END IF;
        
        -- Add issue_resolved_by column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'contract_comments' AND column_name = 'issue_resolved_by') THEN
            ALTER TABLE contract_comments ADD COLUMN issue_resolved_by TEXT;
        END IF;
        
        -- Add issue_resolved_at column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'contract_comments' AND column_name = 'issue_resolved_at') THEN
            ALTER TABLE contract_comments ADD COLUMN issue_resolved_at TIMESTAMP;
        END IF;
        
        -- Add parent_comment_id column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'contract_comments' AND column_name = 'parent_comment_id') THEN
            ALTER TABLE contract_comments ADD COLUMN parent_comment_id TEXT REFERENCES contract_comments(id) ON DELETE SET NULL;
        END IF;
        
        -- Add image_url column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'contract_comments' AND column_name = 'image_url') THEN
            ALTER TABLE contract_comments ADD COLUMN image_url TEXT;
        END IF;
        
        -- Add updated_at column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'contract_comments' AND column_name = 'updated_at') THEN
            ALTER TABLE contract_comments ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        END IF;
    END IF;
END $$; 