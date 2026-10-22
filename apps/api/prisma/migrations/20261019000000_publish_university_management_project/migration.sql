UPDATE "Project"
SET "status" = 'IN_PROGRESS',
    "featured" = TRUE,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'university-management-system';
