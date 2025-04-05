import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
import { storage } from '@forge/api';

const resolver = new Resolver();

// Field type conversion rules
const conversionRules = {
  // Check if field value exceeds text field limit
  exceedsTextLimit: (value) => {
    if (typeof value === 'string') {
      return value.length > 255;
    } else if (value && typeof value === 'object') {
      return JSON.stringify(value).length > 255;
    }
    return false;
  },
  
  // Convert date+time to date
  convertDateTimeToDate: (value) => {
    if (!value) return null;
    
    // Check if it's already a date string
    if (typeof value === 'string' && value.includes('T')) {
      // Extract just the date part (YYYY-MM-DD)
      return value.split('T')[0];
    }
    
    return value;
  },
  
  // Convert user to multi-user
  convertUserToMultiUser: (value) => {
    if (!value) return null;
    
    // If it's a single user value, wrap it in an array
    if (!Array.isArray(value)) {
      return [value];
    }
    
    return value;
  },
  
  // Determine if value can be safely converted
  canConvertValue: (value, sourceType, targetType, sourceCustomType, targetCustomType) => {
    // Text field checks
    if (targetType === 'string' || targetType === 'text') {
      const isMultiline = targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:textarea';
      
      // For regular text fields, check length limit
      if (!isMultiline && conversionRules.exceedsTextLimit(value)) {
        return false;
      }
      
      return true;
    }
    
    // Text to select: never allowed
    if ((sourceType === 'string' || sourceType === 'text') && 
        (targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:select' || 
         targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:multiselect')) {
      return false;
    }
    
    // Other conversions are allowed
    return true;
  }
};

// Function to extract screens array from API response with safeguards
function extractScreensArray(apiResponse) {
  try {
    // Handle different possible API response formats
    if (Array.isArray(apiResponse)) {
      console.log('API response is directly an array');
      return apiResponse;
    } else if (apiResponse && apiResponse.screens && Array.isArray(apiResponse.screens)) {
      console.log('API response has screens property as array');
      return apiResponse.screens;
    } else if (apiResponse && apiResponse.values && Array.isArray(apiResponse.values)) {
      console.log('API response has values property as array');
      return apiResponse.values;
    } else if (apiResponse && typeof apiResponse === 'object') {
      // Try to find the first array property in the response
      for (const key in apiResponse) {
        if (Array.isArray(apiResponse[key])) {
          console.log(`Found array in property '${key}'`);  
          return apiResponse[key];
        }
      }
    }
    
    // If all else fails, return empty array
    console.log('Could not find any array data in API response');
    return [];
  } catch (error) {
    console.error('Error in extractScreensArray:', error);
    return [];
  }
}

// Function to get all custom fields
resolver.define('getCustomFields', async (req) => {
  try {
    const response = await api.asApp().requestJira(route`/rest/api/3/field`);
    const fields = await response.json();
    
    // Filter to only include custom fields - ensure proper filtering
    const customFields = fields.filter(field => field.custom === true);
    console.log(`Found ${customFields.length} custom fields out of ${fields.length} total fields`);
    
    // Map fields with additional debug info and sort by name
    const result = customFields
      .map(field => ({
        id: field.id,
        name: field.name,
        type: field.schema ? field.schema.type : 'unknown',
        customType: field.schema ? field.schema.custom : 'unknown',
        isCustom: field.custom
      }))
      .sort((a, b) => {
        // Case-insensitive sort by name
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
    
    console.log('Returning fields sorted by name - sample:', result.length > 0 ? JSON.stringify(result[0]) : 'No custom fields found');
    return result;
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    return { error: error.message };
  }
});

// Function to get field configuration details
resolver.define('getFieldConfigurations', async (req) => {
  const { sourceFieldId } = req.payload;
  
  try {
    console.log(`Getting field configurations for field: ${sourceFieldId}`);
    
    // Get screens where the field is used
    const screensResponse = await api.asApp().requestJira(route`/rest/api/3/field/${sourceFieldId}/screens`);
    const screens = await screensResponse.json();
    console.log('Screens API response:', JSON.stringify(screens));
    
    // Get issue types where the field is used
    const contextResponse = await api.asApp().requestJira(route`/rest/api/3/field/${sourceFieldId}/contexts`);
    const contexts = await contextResponse.json();
    console.log('Contexts API response:', JSON.stringify(contexts));
    
    // Use our helper function to extract screen and context arrays
    const screensArray = extractScreensArray(screens);
    const contextsArray = extractScreensArray(contexts);
    
    const result = {
      screens: screensArray,
      contexts: contextsArray
    };
    
    console.log('Field configurations return data:');
    console.log('- Screens count:', screensArray.length);
    console.log('- Contexts count:', contextsArray.length);
    
    return result;
  } catch (error) {
    console.error('Error fetching field configurations:', error);
    return { error: error.message };
  }
});

// Function to analyze fields in detail
resolver.define('analyzeFields', async (req) => {
  const { sourceFieldId, targetFieldId } = req.payload;
  
  try {
    // Get field details
    const fieldsResponse = await api.asApp().requestJira(route`/rest/api/3/field`);
    const fields = await fieldsResponse.json();
    
    const sourceField = fields.find(f => f.id === sourceFieldId);
    const targetField = fields.find(f => f.id === targetFieldId);
    
    if (!sourceField || !targetField) {
      return { 
        error: 'One or both fields not found' 
      };
    }
    
    // Get source field screens
    console.log(`Fetching screens for source field: ${sourceFieldId}`);
    const sourceScreensResponse = await api.asApp().requestJira(route`/rest/api/3/field/${sourceFieldId}/screens`);
    // Add status code debugging
    console.log('Source screens response status:', sourceScreensResponse.status);
    const sourceScreens = await sourceScreensResponse.json();
    console.log('Source screens API response:', JSON.stringify(sourceScreens));
    
    // Get target field screens
    console.log(`Fetching screens for target field: ${targetFieldId}`);
    const targetScreensResponse = await api.asApp().requestJira(route`/rest/api/3/field/${targetFieldId}/screens`);
    // Add status code debugging
    console.log('Target screens response status:', targetScreensResponse.status);
    const targetScreens = await targetScreensResponse.json();
    console.log('Target screens API response:', JSON.stringify(targetScreens));
    
    // Add API headers for debugging
    console.log('Response headers for source screens:', JSON.stringify(Object.fromEntries(sourceScreensResponse.headers.entries())));
    console.log('Response headers for target screens:', JSON.stringify(Object.fromEntries(targetScreensResponse.headers.entries())));
    
    // Get source field contexts
    const sourceContextsResponse = await api.asApp().requestJira(route`/rest/api/3/field/${sourceFieldId}/contexts`);
    const sourceContexts = await sourceContextsResponse.json();
    
    // Get target field contexts
    const targetContextsResponse = await api.asApp().requestJira(route`/rest/api/3/field/${targetFieldId}/contexts`);
    const targetContexts = await targetContextsResponse.json();

    // Extract the numeric part of the custom field ID if it's a custom field
    const extractCustomFieldId = (fieldId) => {
      if (fieldId && fieldId.startsWith('customfield_')) {
        return fieldId.replace('customfield_', '');
      }
      return fieldId;
    };
    
    // Source JQL query
    const sourceFieldNumericId = extractCustomFieldId(sourceFieldId);
    const sourceJql = `cf[${sourceFieldNumericId}] is not empty`;
    const sourceValuesResponse = await api.asApp().requestJira(route`/rest/api/3/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jql: sourceJql,
        maxResults: 0,
        fields: ["project"]
      })
    });
    const sourceValuesResult = await sourceValuesResponse.json();

    // Get sample of issues with source field for project analysis
    const sourceProjectsResponse = await api.asApp().requestJira(route`/rest/api/3/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jql: sourceJql,
        maxResults: 100,
        fields: ["project"]
      })
    });
    const sourceProjectsResult = await sourceProjectsResponse.json();
    
    // Extract unique projects
    const sourceProjects = {};
    (sourceProjectsResult.issues || []).forEach(issue => {
      const projectId = issue.fields.project.id;
      const projectName = issue.fields.project.name;
      const projectKey = issue.fields.project.key;
      
      if (!sourceProjects[projectId]) {
        sourceProjects[projectId] = {
          id: projectId,
          name: projectName,
          key: projectKey,
          count: 0
        };
      }
      sourceProjects[projectId].count++;
    });

    // Target field JQL query
    const targetFieldNumericId = extractCustomFieldId(targetFieldId);
    const targetJql = `cf[${targetFieldNumericId}] is not empty`;
    const targetValuesResponse = await api.asApp().requestJira(route`/rest/api/3/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jql: targetJql,
        maxResults: 0,
        fields: ["project"]
      })
    });
    const targetValuesResult = await targetValuesResponse.json();

    // Get sample of issues with target field for project analysis
    const targetProjectsResponse = await api.asApp().requestJira(route`/rest/api/3/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jql: targetJql,
        maxResults: 100,
        fields: ["project"]
      })
    });
    const targetProjectsResult = await targetProjectsResponse.json();
    
    // Extract unique projects
    const targetProjects = {};
    (targetProjectsResult.issues || []).forEach(issue => {
      const projectId = issue.fields.project.id;
      const projectName = issue.fields.project.name;
      const projectKey = issue.fields.project.key;
      
      if (!targetProjects[projectId]) {
        targetProjects[projectId] = {
          id: projectId,
          name: projectName,
          key: projectKey,
          count: 0
        };
      }
      targetProjects[projectId].count++;
    });

    // Check field compatibility
    const sourceType = sourceField.schema ? sourceField.schema.type : 'unknown';
    const targetType = targetField.schema ? targetField.schema.type : 'unknown';
    const sourceCustomType = sourceField.schema ? sourceField.schema.custom : 'unknown';
    const targetCustomType = targetField.schema ? targetField.schema.custom : 'unknown';
    
    // Perform validation checks
    const validationResults = validateFieldConversion(sourceType, targetType, sourceCustomType, targetCustomType);

    // Process screen data using the helper function to extract screen arrays with proper error handling
    console.log('Extracting screens data from API responses...');
    const sourceScreensData = extractScreensArray(sourceScreens);
    const targetScreensData = extractScreensArray(targetScreens);
    const sourceContextsData = extractScreensArray(sourceContexts);
    const targetContextsData = extractScreensArray(targetContexts);
    
    console.log(`Source field screens count: ${sourceScreensData.length}`);
    console.log(`Target field screens count: ${targetScreensData.length}`);
    
    // Check API response structure for debugging
    console.log('Source screens type:', typeof sourceScreens);
    if (typeof sourceScreens === 'object' && sourceScreens !== null) {
      console.log('Source screens keys:', Object.keys(sourceScreens));
    }
    
    console.log('Target screens type:', typeof targetScreens);
    if (typeof targetScreens === 'object' && targetScreens !== null) {
      console.log('Target screens keys:', Object.keys(targetScreens));
    }
    
    // Log first item from each array for structure analysis
    if (sourceScreensData.length > 0) {
      console.log('Sample source screen item:', JSON.stringify(sourceScreensData[0]));
    }
    
    if (targetScreensData.length > 0) {
      console.log('Sample target screen item:', JSON.stringify(targetScreensData[0]));
    }
    
    const result = {
      sourceField: {
        id: sourceFieldId,
        name: sourceField.name,
        type: sourceType,
        customType: sourceCustomType,
        valueCount: sourceValuesResult.total || 0,
        screens: sourceScreensData,
        screenCount: sourceScreensData.length,
        contexts: sourceContextsData,
        contextCount: sourceContextsData.length,
        projects: Object.values(sourceProjects),
        projectCount: Object.keys(sourceProjects).length,
        hasMoreProjects: sourceValuesResult.total > 100
      },
      targetField: {
        id: targetFieldId,
        name: targetField.name,
        type: targetType,
        customType: targetCustomType,
        valueCount: targetValuesResult.total || 0,
        screens: targetScreensData,
        screenCount: targetScreensData.length,
        contexts: targetContextsData,
        contextCount: targetContextsData.length,
        projects: Object.values(targetProjects),
        projectCount: Object.keys(targetProjects).length,
        hasMoreProjects: targetValuesResult.total > 100
      },
      validation: validationResults
    };
    
    console.log('Final analysis result structure:', JSON.stringify({
      sourceFieldScreenCount: result.sourceField.screenCount,
      targetFieldScreenCount: result.targetField.screenCount
    }));
    
    return result;
  } catch (error) {
    console.error('Error analyzing fields:', error);
    return { error: error.message };
  }
});

// Function to validate field conversion compatibility
resolver.define('validateFieldConversion', async (req) => {
  const { sourceFieldId, targetFieldId } = req.payload;
  
  try {
    // Get field details
    const fieldsResponse = await api.asApp().requestJira(route`/rest/api/3/field`);
    const fields = await fieldsResponse.json();
    
    const sourceField = fields.find(f => f.id === sourceFieldId);
    const targetField = fields.find(f => f.id === targetFieldId);
    
    if (!sourceField || !targetField) {
      return { 
        valid: false, 
        error: 'One or both fields not found' 
      };
    }
    
    const sourceType = sourceField.schema ? sourceField.schema.type : 'unknown';
    const targetType = targetField.schema ? targetField.schema.type : 'unknown';
    const sourceCustomType = sourceField.schema ? sourceField.schema.custom : 'unknown';
    const targetCustomType = targetField.schema ? targetField.schema.custom : 'unknown';
    
    // Perform validation checks
    const isValid = validateFieldConversion(sourceType, targetType, sourceCustomType, targetCustomType);
    
    return {
      valid: isValid.valid,
      rules: isValid.rules
    };
  } catch (error) {
    console.error('Error validating field conversion:', error);
    return { 
      valid: false, 
      error: error.message 
    };
  }
});

// Function to start field consolidation
resolver.define('startConsolidation', async (req) => {
  const { sourceFieldId, targetFieldId } = req.payload;
  
  try {
    // Save migration details
    const migrationId = Date.now().toString();
    await storage.set('migration', migrationId, {
      sourceFieldId,
      targetFieldId,
      status: 'IN_PROGRESS',
      migrationDate: new Date().toISOString(),
      issueMigrationProgress: 0,
      totalIssues: 0,
      screens: {
        total: 0,
        processed: 0,
        succeeded: 0,
        failed: 0,
        logs: []
      },
      transferLogs: []
    });
    
    // Start the actual migration process
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

// Function to migrate a field to a specific screen
async function migrateFieldToScreen(sourceFieldId, targetFieldId, screen, transferLogs, migrationId) {
  try {
    const screenId = screen.id;
    const screenName = screen.name || screenId;
    
    console.log(`Processing screen ${screenId} - ${screenName}`);
    transferLogs.push(`Processing screen: ${screenName}`);
    
    // Step 1: Get all tabs for this screen
    const tabsResponse = await api.asApp().requestJira(route`/rest/api/3/screens/${screenId}/tabs`);
    
    if (tabsResponse.status !== 200) {
      console.error(`Failed to get tabs for screen ${screenId}. Status: ${tabsResponse.status}`);
      transferLogs.push(`❌ Failed to get tabs for screen ${screenName} - HTTP ${tabsResponse.status}`);
      return false;
    }
    
    const tabs = await tabsResponse.json();
    
    // Step 2: Process each tab
    for (const tab of tabs) {
      const tabId = tab.id;
      const tabName = tab.name || tabId;
      
      console.log(`Processing tab ${tabId} - ${tabName} on screen ${screenName}`);
      transferLogs.push(`  Processing tab: ${tabName}`);
      
      // Step 3: Check if target field already exists on this tab
      const fieldsResponse = await api.asApp().requestJira(
        route`/rest/api/3/screens/${screenId}/tabs/${tabId}/fields`
      );
      
      if (fieldsResponse.status !== 200) {
        console.error(`Failed to get fields for tab ${tabId}. Status: ${fieldsResponse.status}`);
        transferLogs.push(`  ❌ Failed to get fields for tab ${tabName} - HTTP ${fieldsResponse.status}`);
        continue;
      }
      
      const fields = await fieldsResponse.json();
      const fieldExists = fields.some(field => field.id === targetFieldId);
      
      if (fieldExists) {
        console.log(`Field ${targetFieldId} already exists on tab ${tabId}. Skipping.`);
        transferLogs.push(`  ⚠️ Field already exists on tab ${tabName} - skipped`);
        continue;
      }
      
      // Step 4: Get the position of the source field (if it exists)
      const sourceFieldIndex = fields.findIndex(field => field.id === sourceFieldId);
      
      // Step 5: Add the target field to the tab
      const addResponse = await api.asApp().requestJira(
        route`/rest/api/3/screens/${screenId}/tabs/${tabId}/fields`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fieldId: targetFieldId
          })
        }
      );
      
      if (addResponse.status >= 200 && addResponse.status < 300) {
        console.log(`Successfully added field ${targetFieldId} to tab ${tabId} on screen ${screenId}`);
        transferLogs.push(`  ✅ Successfully added field to tab ${tabName}`);
        
        // Update the success counter
        const migrationData = await storage.get('migration', migrationId);
        if (migrationData && migrationData.screens) {
          await storage.set('migration', migrationId, {
            ...migrationData,
            screens: {
              ...migrationData.screens,
              processed: (migrationData.screens.processed || 0) + 1,
              succeeded: (migrationData.screens.succeeded || 0) + 1,
              logs: [...(migrationData.screens.logs || []), `✅ Added to screen: ${screenName}, tab: ${tabName}`]
            }
          });
        }
        
        // Step 6: If source field exists, try to move the target field to the same position
        if (sourceFieldIndex !== -1) {
          try {
            // This moves the field after the source field
            // Note: Using the REST API endpoint for moving fields
            const moveResponse = await api.asApp().requestJira(
              route`/rest/api/3/screens/${screenId}/tabs/${tabId}/fields/${targetFieldId}/move`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  after: sourceFieldId
                })
              }
            );
            
            if (moveResponse.status === 204) {
              console.log(`Successfully moved field ${targetFieldId} after ${sourceFieldId} in tab ${tabId}`);
              transferLogs.push(`  ✅ Moved field to position after source field in tab ${tabName}`);
            } else {
              console.warn(`Failed to move field ${targetFieldId} after ${sourceFieldId}. Status: ${moveResponse.status}`);
              transferLogs.push(`  ⚠️ Could not move field to desired position - HTTP ${moveResponse.status}`);
            }
          } catch (moveError) {
            console.error(`Error moving field ${targetFieldId}:`, moveError);
            transferLogs.push(`  ⚠️ Error moving field: ${moveError.message}`);
          }
        }
      } else {
        console.error(`Failed to add field ${targetFieldId} to tab ${tabId}. Status: ${addResponse.status}`);
        transferLogs.push(`  ❌ Failed to add field to tab ${tabName} - HTTP ${addResponse.status}`);
        
        // Update the failure counter
        const migrationData = await storage.get('migration', migrationId);
        if (migrationData && migrationData.screens) {
          await storage.set('migration', migrationId, {
            ...migrationData,
            screens: {
              ...migrationData.screens,
              processed: (migrationData.screens.processed || 0) + 1,
              failed: (migrationData.screens.failed || 0) + 1,
              logs: [...(migrationData.screens.logs || []), `❌ Failed to add to screen: ${screenName}, tab: ${tabName}`]
            }
          });
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error migrating field to screen ${screen.id}:`, error);
    transferLogs.push(`❌ Error processing screen ${screen.name || screen.id}: ${error.message}`);
    
    // Update the failure counter
    const migrationData = await storage.get('migration', migrationId);
    if (migrationData && migrationData.screens) {
      await storage.set('migration', migrationId, {
        ...migrationData,
        screens: {
          ...migrationData.screens,
          processed: (migrationData.screens.processed || 0) + 1,
          failed: (migrationData.screens.failed || 0) + 1,
          logs: [...(migrationData.screens.logs || []), `❌ Error with screen ${screen.name || screen.id}: ${error.message}`]
        }
      });
    }
    
    return false;
  }
}

// Function to migrate field configurations
async function migrateFieldConfigurations(sourceFieldId, targetFieldId, migrationId) {
  try {
    // Get field details
    const fieldsResponse = await api.asApp().requestJira(route`/rest/api/3/field`);
    const fields = await fieldsResponse.json();
    
    const sourceField = fields.find(f => f.id === sourceFieldId);
    const targetField = fields.find(f => f.id === targetFieldId);
    
    if (!sourceField || !targetField) {
      throw new Error('Source or target field not found');
    }
    
    // Extract field type information
    const sourceType = sourceField.schema ? sourceField.schema.type : 'unknown';
    const targetType = targetField.schema ? targetField.schema.type : 'unknown';
    const sourceCustomType = sourceField.schema ? sourceField.schema.custom : 'unknown';
    const targetCustomType = targetField.schema ? targetField.schema.custom : 'unknown';
    
    // 1. Get all screens where source field is used
    const screensResponse = await api.asApp().requestJira(route`/rest/api/3/field/${sourceFieldId}/screens`);
    const screens = await screensResponse.json();
    const screensArray = extractScreensArray(screens);
    
    console.log(`Starting screen transfer process: ${screensArray.length} screens to process`);
    
    // Create a transfer log entry
    const transferLogs = [];
    
    // Update migration with screen information
    const currentMigration = await storage.get('migration', migrationId);
    if (currentMigration) {
      await storage.set('migration', migrationId, {
        ...currentMigration,
        screens: {
          ...currentMigration.screens,
          total: screensArray.length,
          processed: 0,
          succeeded: 0,
          failed: 0,
          logs: []
        }
      });
    }
    
    // Use the new migrateFieldToScreen function for each screen
    for (const screen of screensArray) {
      await migrateFieldToScreen(sourceFieldId, targetFieldId, screen, transferLogs, migrationId);
    }
    
    console.log('Screen transfer logs:', transferLogs);
    
    // Final update with complete transfer logs
    const migrationData = await storage.get('migration', migrationId);
    if (migrationData) {
      await storage.set('migration', migrationId, {
        ...migrationData,
        transferLogs
      });
    }
    
    // 3. Find all issues with the source field and start migrating values
    await startValueMigration(sourceFieldId, targetFieldId, migrationId, sourceType, targetType, sourceCustomType, targetCustomType);
    
  } catch (error) {
    console.error('Error in field configuration migration:', error);
    
    // Update migration status to error
    await storage.set('migration', migrationId, {
      sourceFieldId,
      targetFieldId,
      status: 'ERROR',
      migrationDate: new Date().toISOString(),
      error: error.message
    });
  }
}

// Function to convert field value based on field types
function convertFieldValue(value, sourceType, targetType, sourceCustomType, targetCustomType) {
  if (value === null || value === undefined) {
    return null;
  }
  
  // 1. Date and time to date conversion
  if (sourceCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:datetime' &&
      targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:datepicker') {
    return conversionRules.convertDateTimeToDate(value);
  }
  
  // 2. Single user to multi-user conversion
  if (sourceCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:userpicker' &&
      targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:multiuserpicker') {
    return conversionRules.convertUserToMultiUser(value);
  }
  
  // 3. For text fields, verify length constraints
  if ((targetType === 'string' || targetType === 'text') && 
      targetCustomType !== 'com.atlassian.jira.plugin.system.customfieldtypes:textarea') {
    // For regular text fields, truncate if needed
    if (typeof value === 'string' && value.length > 255) {
      return value.substring(0, 252) + '...';
    }
  }
  
  // Default: return value unchanged
  return value;
}

// Function to migrate field values
async function startValueMigration(sourceFieldId, targetFieldId, migrationId, sourceType, targetType, sourceCustomType, targetCustomType) {
  try {
    // Extract the numeric part of the custom field ID if it's a custom field
    const extractCustomFieldId = (fieldId) => {
      if (fieldId.startsWith('customfield_')) {
        return fieldId.replace('customfield_', '');
      }
      return fieldId;
    };
    
    // This would be a JQL search to find all issues with the source field populated
    // Using the format "cf[ID]" is not empty for custom fields
    const sourceFieldNumericId = extractCustomFieldId(sourceFieldId);
    const jql = `cf[${sourceFieldNumericId}] is not empty`;
    
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
    const migrationUpdate = await storage.get('migration', migrationId);
    if (migrationUpdate) {
      await storage.set('migration', migrationId, {
        ...migrationUpdate,
        totalIssues
      });
    }
    
    // Process issues in batches
    const batchSize = 50;
    let processed = 0;
    
    for (let startAt = 0; startAt < totalIssues; startAt += batchSize) {
      // Get batch of issues
      const batchResponse = await api.asApp().requestJira(route`/rest/api/3/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jql,
          maxResults: batchSize,
          startAt,
          fields: [sourceFieldId]
        })
      });
      
      const batchResult = await batchResponse.json();
      
      // Process each issue in the batch
      for (const issue of batchResult.issues || []) {
        try {
          // Get the source field value
          const sourceValue = issue.fields[sourceFieldId];
          
          // Convert the value based on field types
          const targetValue = convertFieldValue(
            sourceValue, 
            sourceType, 
            targetType, 
            sourceCustomType, 
            targetCustomType
          );
          
          // Skip if conversion resulted in null
          if (targetValue === null) {
            continue;
          }
          
          // Update the issue with the new value
          await api.asApp().requestJira(route`/rest/api/3/issue/${issue.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fields: {
                [targetFieldId]: targetValue
              }
            })
          });
          
          processed++;
          
          // Update migration progress periodically
          if (processed % 10 === 0 || processed === totalIssues) {
            const migrationProgress = await storage.get('migration', migrationId);
            if (migrationProgress) {
              await storage.set('migration', migrationId, {
                ...migrationProgress,
                issueMigrationProgress: processed
              });
            }
          }
        } catch (error) {
          console.error(`Error processing issue ${issue.id}:`, error);
        }
      }
    }
    
    // Update migration to complete
    const migrationComplete = await storage.get('migration', migrationId);
    if (migrationComplete) {
      await storage.set('migration', migrationId, {
        ...migrationComplete,
        status: 'COMPLETED',
        issueMigrationProgress: processed
      });
    }
  } catch (error) {
    console.error('Error in value migration:', error);
    
    // Update migration status to error
    const migrationError = await storage.get('migration', migrationId);
    if (migrationError) {
      await storage.set('migration', migrationId, {
        ...migrationError,
        status: 'ERROR',
        error: error.message
      });
    }
  }
}

// Function to get migration status
resolver.define('getMigrationStatus', async (req) => {
  const { migrationId } = req.payload;
  
  try {
    const migration = await storage.get('migration', migrationId);
    return migration || { error: 'Migration not found' };
  } catch (error) {
    console.error('Error fetching migration status:', error);
    return { error: error.message };
  }
});

// Function to get all past migrations
resolver.define('getMigrationHistory', async (req) => {
  try {
    const query = await storage.query('migration').getMany();
    return query.results.map(r => ({
      id: r.key,
      ...r.value
    }));
  } catch (error) {
    console.error('Error fetching migration history:', error);
    return { error: error.message };
  }
});

// Function to validate field conversion
function validateFieldConversion(sourceType, targetType, sourceCustomType, targetCustomType) {
  const results = {
    valid: true,
    rules: []
  };
  
  // Check if converting to text (always valid if target is text)
  const canConvertToText = targetType === 'string' || targetType === 'text';
  results.rules.push({
    rule: 'canConvertToText',
    valid: canConvertToText,
    message: 'Any field can be converted to a text field if values are under 255 characters.'
  });
  
  // Check if converting to multi-line text (always valid)
  const isTargetMultilineText = targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:textarea';
  results.rules.push({
    rule: 'canConvertToMultilineText',
    valid: isTargetMultilineText,
    message: 'Any field can be converted to a multi-line text field.'
  });
  
  // Check text to select conversion (not valid)
  const isSourceText = sourceType === 'string' || sourceType === 'text';
  const isTargetSelect = 
    targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:select' ||
    targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:multiselect';
  
  const textToSelectValid = !(isSourceText && isTargetSelect);
  results.rules.push({
    rule: 'cannotConvertTextToSelect',
    valid: textToSelectValid,
    message: 'Text fields cannot be converted to select fields.',
    critical: true
  });
  
  // Check date/time to date conversion
  const isSourceDateTime = sourceCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:datetime';
  const isTargetDate = targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:datepicker';
  
  if (isSourceDateTime || isTargetDate) {
    results.rules.push({
      rule: 'canConvertDateTimeToDate',
      valid: true,
      message: 'Date and time fields can be converted to date fields. The time portion will be set to 00:00.'
    });
  }
  
  // Check select to radio conversion
  const isSourceSelect = sourceCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:select';
  const isTargetRadio = targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:radiobuttons';
  
  if (isSourceSelect || isTargetRadio) {
    results.rules.push({
      rule: 'canConvertSelectToRadio',
      valid: true,
      message: 'Select fields can be converted to radio buttons.'
    });
  }
  
  // Check user to multi-user conversion
  const isSourceUser = sourceCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:userpicker';
  const isTargetMultiUser = targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:multiuserpicker';
  
  if (isSourceUser || isTargetMultiUser) {
    results.rules.push({
      rule: 'canConvertUserToMultiUser',
      valid: true,
      message: 'Single user fields can be converted to multi-user fields.'
    });
  }
  
  // Check if any critical rules are invalid
  results.valid = !results.rules.some(rule => rule.critical && !rule.valid);
  
  return results;
}

export const handler = resolver.getDefinitions();