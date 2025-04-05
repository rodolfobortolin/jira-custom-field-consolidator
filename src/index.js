import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { storage } from '@forge/api';

const resolver = new Resolver();

// Function to get all custom fields
resolver.define('getCustomFields', async (req) => {
  try {
    const response = await api.asApp().requestJira(route`/rest/api/3/field`);
    const fields = await response.json();
    
    // Filter to only include custom fields
    const customFields = fields.filter(field => field.custom);
    
    return customFields.map(field => ({
      id: field.id,
      name: field.name,
      type: field.schema ? field.schema.type : 'unknown',
      customType: field.schema ? field.schema.custom : 'unknown'
    }));
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    return { error: error.message };
  }
});

// Function to get field configuration details
resolver.define('getFieldConfigurations', async (req) => {
  const { sourceFieldId } = req.payload;
  
  try {
    // Get screens where the field is used
    const screensResponse = await api.asApp().requestJira(route`/rest/api/3/field/${sourceFieldId}/screens`);
    const screens = await screensResponse.json();
    
    // Get issue types where the field is used
    const contextResponse = await api.asApp().requestJira(route`/rest/api/3/field/${sourceFieldId}/contexts`);
    const contexts = await contextResponse.json();
    
    return {
      screens: screens.screens || [],
      contexts: contexts.values || []
    };
  } catch (error) {
    console.error('Error fetching field configurations:', error);
    return { error: error.message };
  }
});

// Function to start field consolidation
resolver.define('startConsolidation', async (req) => {
  const { sourceFieldId, targetFieldId } = req.payload;
  
  try {
    // Save migration details
    const migrationId = Date.now().toString();
    await storage.entity('migration').set(migrationId, {
      sourceFieldId,
      targetFieldId,
      status: 'IN_PROGRESS',
      migrationDate: new Date().toISOString(),
      issueMigrationProgress: 0,
      totalIssues: 0
    });
    
    // Start the actual migration process
    // This would be a separate function that handles:
    // 1. Update field configurations (screens, contexts)
    // 2. Copy field values from source to target
    // 3. Update status as it proceeds
    
    // For demonstration, we'll simulate the start of the process
    await migrateFieldConfigurations(sourceFieldId, targetFieldId, migrationId);
    
    return { 
      migrationId,
      message: 'Consolidation process has started'
    };
  } catch (error) {
    console.error('Error starting field consolidation:', error);
    return { error: error.message };
  }
});

// Function to migrate field configurations
async function migrateFieldConfigurations(sourceFieldId, targetFieldId, migrationId) {
  try {
    // 1. Get all screens where source field is used
    const screensResponse = await api.asApp().requestJira(route`/rest/api/3/field/${sourceFieldId}/screens`);
    const screens = await screensResponse.json();
    
    // 2. Add target field to those screens
    for (const screen of screens.screens || []) {
      try {
        await api.asApp().requestJira(route`/rest/api/3/screens/${screen.id}/availableFields`, {
          method: 'GET'
        });
        
        await api.asApp().requestJira(route`/rest/api/3/screens/${screen.id}/tabs/${screen.tabId}/fields`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fieldId: targetFieldId
          })
        });
      } catch (error) {
        console.error(`Error adding target field to screen ${screen.id}:`, error);
      }
    }
    
    // 3. Find all issues with the source field and start migrating values
    await startValueMigration(sourceFieldId, targetFieldId, migrationId);
    
  } catch (error) {
    console.error('Error in field configuration migration:', error);
    
    // Update migration status to error
    await storage.entity('migration').set(migrationId, {
      sourceFieldId,
      targetFieldId,
      status: 'ERROR',
      migrationDate: new Date().toISOString(),
      error: error.message
    });
  }
}

// Function to migrate field values
async function startValueMigration(sourceFieldId, targetFieldId, migrationId) {
  try {
    // This would be a JQL search to find all issues with the source field populated
    const jql = `"${sourceFieldId}" is not EMPTY`;
    
    const searchResponse = await api.asApp().requestJira(route`/rest/api/3/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jql,
        maxResults: 0, // Just get the total count for now
        fields: ["id"]
      })
    });
    
    const searchResult = await searchResponse.json();
    const totalIssues = searchResult.total || 0;
    
    // Update migration with total issues count
    await storage.entity('migration').update(migrationId, (current) => ({
      ...current,
      totalIssues
    }));
    
    // In a real implementation, you would:
    // 1. Process issues in batches
    // 2. Update progress as each batch completes
    // 3. Update status when done
    
    // For demonstration, we'll update to complete after a delay
    setTimeout(async () => {
      await storage.entity('migration').update(migrationId, (current) => ({
        ...current,
        status: 'COMPLETED',
        issueMigrationProgress: totalIssues
      }));
    }, 5000);
    
  } catch (error) {
    console.error('Error in value migration:', error);
    
    // Update migration status to error
    await storage.entity('migration').update(migrationId, (current) => ({
      ...current,
      status: 'ERROR',
      error: error.message
    }));
  }
}

// Function to get migration status
resolver.define('getMigrationStatus', async (req) => {
  const { migrationId } = req.payload;
  
  try {
    const migration = await storage.entity('migration').get(migrationId);
    return migration;
  } catch (error) {
    console.error('Error fetching migration status:', error);
    return { error: error.message };
  }
});

// Function to get all past migrations
resolver.define('getMigrationHistory', async (req) => {
  try {
    const query = await storage.entity('migration').query().getMany();
    return query.results.map(r => ({
      id: r.key,
      ...r.value
    }));
  } catch (error) {
    console.error('Error fetching migration history:', error);
    return { error: error.message };
  }
});

export const handler = resolver.getDefinitions();
