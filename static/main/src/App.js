import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';

// Estilos inline para evitar problemas de CSP
const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    marginBottom: '20px',
    borderBottom: '1px solid #dfe1e6',
    paddingBottom: '15px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '500',
    marginBottom: '8px'
  },
  description: {
    color: '#6b778c',
    marginBottom: '15px'
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#0052CC',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginRight: '10px'
  },
  disabledButton: {
    padding: '8px 16px',
    backgroundColor: '#dfe1e6',
    color: '#505f79',
    border: 'none',
    borderRadius: '3px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'not-allowed'
  },
  errorMessage: {
    backgroundColor: '#FFEBE6',
    color: '#DE350B',
    padding: '10px',
    borderRadius: '3px',
    marginBottom: '16px'
  },
  warningPanel: {
    backgroundColor: '#FFFAE6',
    padding: '10px',
    borderRadius: '3px',
    marginBottom: '16px',
    display: 'flex'
  },
  successPanel: {
    backgroundColor: '#E3FCEF',
    padding: '10px',
    borderRadius: '3px',
    marginBottom: '16px',
    display: 'flex'
  },
  infoPanel: {
    backgroundColor: '#DEEBFF',
    padding: '10px',
    borderRadius: '3px',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px'
  },
  fieldList: {
    listStyleType: 'none',
    padding: 0,
    margin: '16px 0'
  },
  fieldItem: {
    padding: '8px 0',
    borderBottom: '1px solid #f4f5f7'
  },
  selectWrapper: {
    marginBottom: '15px'
  },
  selectLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500'
  },
  select: {
    width: '100%',
    padding: '8px',
    border: '2px solid #dfe1e6',
    borderRadius: '3px',
    fontSize: '14px'
  },
  tabPanel: {
    padding: '10px 0'
  },
  tabList: {
    borderBottom: '2px solid #dfe1e6',
    display: 'flex',
    marginBottom: '16px'
  },
  tab: {
    padding: '10px 16px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px'
  },
  activeTab: {
    padding: '10px 16px',
    cursor: 'pointer',
    borderBottom: '2px solid #0052CC',
    fontWeight: '500',
    marginBottom: '-2px'
  },
  progressBar: {
    height: '10px',
    backgroundColor: '#dfe1e6',
    borderRadius: '5px',
    marginTop: '10px',
    marginBottom: '20px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0052CC',
    borderRadius: '5px',
    transition: 'width 0.3s ease'
  },
  tag: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#dfe1e6',
    borderRadius: '3px',
    margin: '0 4px 4px 0',
    fontSize: '12px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px'
  },
  tableHeader: {
    textAlign: 'left',
    padding: '8px 12px',
    borderBottom: '2px solid #DFE1E6',
    fontWeight: '500'
  },
  tableCell: {
    padding: '8px 12px',
    borderBottom: '1px solid #DFE1E6'
  },
  statusIcon: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '8px',
    verticalAlign: 'middle'
  },
  flexRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  ruleItem: {
    display: 'flex',
    padding: '4px 0',
    borderBottom: '1px solid #f4f5f7'
  },
  ruleIcon: {
    marginRight: '8px',
    color: '#0052CC'
  },
  conversionRulesCard: {
    border: '1px solid #DFE1E6',
    borderRadius: '3px',
    marginBottom: '20px',
    padding: '16px'
  },
  conversionRulesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '500',
    margin: 0
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#0052CC',
    padding: '4px 8px',
    fontSize: '13px'
  },
  validConversionItem: {
    color: '#00875A',
    padding: '4px 0',
    display: 'flex',
    alignItems: 'center'
  },
  invalidConversionItem: {
    color: '#DE350B',
    padding: '4px 0',
    display: 'flex',
    alignItems: 'center'
  },
  neutralConversionItem: {
    color: '#6B778C',
    padding: '4px 0',
    display: 'flex',
    alignItems: 'center'
  },
  dashIcon: {
    marginRight: '8px',
    fontSize: '16px'
  },
  analysisSummary: {
    marginTop: '20px',
    marginBottom: '20px',
    padding: '16px',
    border: '1px solid #DFE1E6',
    borderRadius: '3px',
    backgroundColor: '#F4F5F7'
  },
  analysisSection: {
    marginBottom: '16px'
  },
  analysisHeader: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '8px'
  },
  analysisStat: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px'
  },
  analysisLabel: {
    width: '150px',
    fontWeight: '500',
    flexShrink: 0
  },
  analysisValue: {
    flexGrow: 1
  },
  buttonContainer: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px'
  },
  projectList: {
    maxHeight: '200px',
    overflowY: 'auto',
    padding: '8px',
    border: '1px solid #DFE1E6',
    borderRadius: '3px',
    backgroundColor: '#FFFFFF',
    marginTop: '8px'
  },
  projectItem: {
    padding: '4px 0',
    borderBottom: '1px solid #F4F5F7',
    display: 'flex',
    justifyContent: 'space-between'
  },
  screenList: {
    maxHeight: '200px',
    overflowY: 'auto',
    padding: '8px',
    border: '1px solid #DFE1E6',
    borderRadius: '3px',
    backgroundColor: '#FFFFFF',
    marginTop: '8px'
  },
  screenItem: {
    padding: '4px 0',
    borderBottom: '1px solid #F4F5F7'
  }
};

// Field type conversion rules
const conversionRules = {
  // Any field can be converted to text if values are under 255 chars
  canConvertToText: function(sourceType, targetType) {
    return targetType === 'string' || targetType === 'text';
  },
  
  // Any field can be converted to multi-line text
  canConvertToMultilineText: function(sourceType, targetType, sourceCustomType, targetCustomType) {
    return targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:textarea';
  },
  
  // Text fields cannot be converted to select fields
  cannotConvertTextToSelect: function(sourceType, targetType, sourceCustomType, targetCustomType) {
    const isSourceText = sourceType === 'string' || sourceType === 'text';
    const isTargetSelect = 
      targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:select' ||
      targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:multiselect';
    
    return !(isSourceText && isTargetSelect);
  },
  
  // Date and time can be converted to date fields
  canConvertDateTimeToDate: function(sourceType, targetType, sourceCustomType, targetCustomType) {
    const isSourceDateTime = 
      sourceCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:datetime';
    const isTargetDate = 
      targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:datepicker';
    
    return !isSourceDateTime || !isTargetDate || (isSourceDateTime && isTargetDate);
  },
  
  // Select can be converted to radio buttons
  canConvertSelectToRadio: function(sourceType, targetType, sourceCustomType, targetCustomType) {
    const isSourceSelect = 
      sourceCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:select';
    const isTargetRadio = 
      targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:radiobuttons';
    
    return !isSourceSelect || !isTargetRadio || (isSourceSelect && isTargetRadio);
  },
  
  // Single user can be converted to multi-user
  canConvertUserToMultiUser: function(sourceType, targetType, sourceCustomType, targetCustomType) {
    const isSourceUser = 
      sourceCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:userpicker';
    const isTargetMultiUser = 
      targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:multiuserpicker';
    
    return !isSourceUser || !isTargetMultiUser || (isSourceUser && isTargetMultiUser);
  }
};

// Validator that applies all rules
const validateConversion = (sourceType, targetType, sourceCustomType, targetCustomType) => {
  const results = {
    valid: true,
    rules: []
  };
  
  // Check if converting to text (always valid if target is text)
  if (conversionRules.canConvertToText(sourceType, targetType)) {
    results.rules.push({
      rule: 'canConvertToText',
      valid: true,
      message: 'Any field can be converted to a text field if values are under 255 characters.'
    });
  }
  
  // Check if converting to multi-line text (always valid)
  if (conversionRules.canConvertToMultilineText(sourceType, targetType, sourceCustomType, targetCustomType)) {
    results.rules.push({
      rule: 'canConvertToMultilineText',
      valid: true,
      message: 'Any field can be converted to a multi-line text field.'
    });
  }
  
  // Check text to select conversion (not valid)
  const textToSelectValid = conversionRules.cannotConvertTextToSelect(sourceType, targetType, sourceCustomType, targetCustomType);
  results.rules.push({
    rule: 'cannotConvertTextToSelect',
    valid: textToSelectValid,
    message: 'Text fields cannot be converted to select fields.',
    critical: true
  });
  
  // Check date/time to date conversion
  const dateTimeToDateValid = conversionRules.canConvertDateTimeToDate(sourceType, targetType, sourceCustomType, targetCustomType);
  if (sourceCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:datetime' || 
      targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:datepicker') {
    results.rules.push({
      rule: 'canConvertDateTimeToDate',
      valid: dateTimeToDateValid,
      message: 'Date and time fields can be converted to date fields. The time portion will be set to 00:00.'
    });
  }
  
  // Check select to radio conversion
  const selectToRadioValid = conversionRules.canConvertSelectToRadio(sourceType, targetType, sourceCustomType, targetCustomType);
  if (sourceCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:select' || 
      targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:radiobuttons') {
    results.rules.push({
      rule: 'canConvertSelectToRadio',
      valid: selectToRadioValid,
      message: 'Select fields can be converted to radio buttons.'
    });
  }
  
  // Check user to multi-user conversion
  const userToMultiUserValid = conversionRules.canConvertUserToMultiUser(sourceType, targetType, sourceCustomType, targetCustomType);
  if (sourceCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:userpicker' || 
      targetCustomType === 'com.atlassian.jira.plugin.system.customfieldtypes:multiuserpicker') {
    results.rules.push({
      rule: 'canConvertUserToMultiUser',
      valid: userToMultiUserValid,
      message: 'Single user fields can be converted to multi-user fields.'
    });
  }
  
  // Check if any critical rules are invalid
  results.valid = !results.rules.some(rule => rule.critical && !rule.valid);
  
  return results;
};

function App() {
  const [customFields, setCustomFields] = useState([]);
  const [sourceField, setSourceField] = useState(null);
  const [targetField, setTargetField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configDetails, setConfigDetails] = useState(null);
  const [migration, setMigration] = useState(null);
  const [migrationHistory, setMigrationHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const [validationResults, setValidationResults] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showSourceScreens, setShowSourceScreens] = useState(false);
  const [showTargetScreens, setShowTargetScreens] = useState(false);
  const [showSourceProjects, setShowSourceProjects] = useState(false);
  const [showTargetProjects, setShowTargetProjects] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        setError(null);
        
        // Fetch custom fields
        const fields = await invoke('getCustomFields');
        console.log('Custom fields received:', fields);
        
        if (fields.error) {
          setError(fields.error);
        } else {
          setCustomFields(fields);
        }
        
        // Fetch migration history
        const history = await invoke('getMigrationHistory');
        console.log('Migration history received:', history);
        
        if (!history.error) {
          setMigrationHistory(history);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (sourceField) {
      fetchFieldDetails();
    } else {
      setConfigDetails(null);
    }
  }, [sourceField]);

  useEffect(() => {
    if (sourceField && targetField) {
      validateFieldConversion();
    } else {
      setValidationResults(null);
      setAnalysisResults(null);
    }
  }, [sourceField, targetField]);

  useEffect(() => {
    if (migration && migration.status === 'IN_PROGRESS') {
      const interval = setInterval(checkMigrationStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [migration]);

  const fetchFieldDetails = async () => {
    try {
      setError(null);
      console.log('Fetching field details for:', sourceField);
      
      const details = await invoke('getFieldConfigurations', { 
        sourceFieldId: sourceField 
      });
      
      console.log('Field details received:', details);
      
      if (details.error) {
        setError(details.error);
      } else {
        setConfigDetails(details);
      }
    } catch (err) {
      console.error('Error fetching field details:', err);
      setError(err.message || 'Failed to fetch field details');
    }
  };
  
  const analyzeFields = async () => {
    if (!sourceField || !targetField) return;
    
    try {
      setError(null);
      setIsAnalyzing(true);
      console.log('Analyzing fields...');
      
      const results = await invoke('analyzeFields', {
        sourceFieldId: sourceField,
        targetFieldId: targetField
      });
      
      console.log('Analysis results:', results);
      
      if (results.error) {
        setError(results.error);
      } else {
        setAnalysisResults(results);
      }
      
      setIsAnalyzing(false);
    } catch (err) {
      console.error('Error analyzing fields:', err);
      setError(err.message || 'Failed to analyze fields');
      setIsAnalyzing(false);
    }
  };

  const validateFieldConversion = () => {
    if (!sourceField || !targetField) return;
    
    const sourceFieldData = customFields.find(f => f.id === sourceField);
    const targetFieldData = customFields.find(f => f.id === targetField);
    
    if (!sourceFieldData || !targetFieldData) return;
    
    const results = validateConversion(
      sourceFieldData.type,
      targetFieldData.type,
      sourceFieldData.customType,
      targetFieldData.customType
    );
    
    setValidationResults(results);
  };

  const startConsolidation = async () => {
    try {
      setError(null);
      setIsProcessing(true);
      console.log('Starting consolidation process...');
      
      const result = await invoke('startConsolidation', {
        sourceFieldId: sourceField,
        targetFieldId: targetField
      });
      
      console.log('Consolidation started:', result);
      setIsProcessing(false);
      
      if (result.error) {
        setError(result.error);
      } else {
        checkMigrationStatus(result.migrationId);
      }
    } catch (err) {
      console.error('Error starting consolidation:', err);
      setError(err.message || 'Failed to start consolidation');
      setIsProcessing(false);
    }
  };

  const checkMigrationStatus = async (migrationId) => {
    try {
      const currentMigrationId = migrationId || (migration ? migration.migrationId : null);
      if (!currentMigrationId) return;
      
      console.log('Checking migration status for:', currentMigrationId);
      
      const status = await invoke('getMigrationStatus', {
        migrationId: currentMigrationId
      });
      
      console.log('Migration status received:', status);
      
      if (status.error) {
        setError(status.error);
      } else {
        setMigration({
          ...status,
          migrationId: currentMigrationId
        });
        
        // Refresh history if migration is completed
        if (status.status === 'COMPLETED' || status.status === 'ERROR') {
          const history = await invoke('getMigrationHistory');
          if (!history.error) {
            setMigrationHistory(history);
          }
        }
      }
    } catch (err) {
      console.error('Error checking migration status:', err);
      setError(err.message || 'Failed to check migration status');
    }
  };

  const handleSourceFieldChange = (e) => {
    const fieldId = e.target.value;
    if (fieldId) {
      setSourceField(fieldId);
      if (fieldId === targetField) {
        setTargetField(null);
      }
    } else {
      setSourceField(null);
    }
  };

  const handleTargetFieldChange = (e) => {
    const fieldId = e.target.value;
    if (fieldId) {
      setTargetField(fieldId);
    } else {
      setTargetField(null);
    }
  };

  const getMigrationProgress = () => {
    if (!migration) return 0;
    if (migration.totalIssues === 0) return 0;
    return (migration.issueMigrationProgress / migration.totalIssues) * 100;
  };

  const getStatusIndicator = (status) => {
    let backgroundColor;
    
    switch (status) {
      case 'COMPLETED':
        backgroundColor = '#00875A'; // Green
        break;
      case 'IN_PROGRESS':
        backgroundColor = '#0052CC'; // Blue
        break;
      case 'ERROR':
        backgroundColor = '#DE350B'; // Red
        break;
      default:
        backgroundColor = '#6B778C'; // Gray
    }
    
    return (
      <span style={{...styles.statusIcon, backgroundColor}}>
        {/* Status icon */}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getFieldType = (fieldId) => {
    const field = customFields.find(f => f.id === fieldId);
    return field ? field.type : 'unknown';
  };

  const getFieldCustomType = (fieldId) => {
    const field = customFields.find(f => f.id === fieldId);
    return field ? field.customType : 'unknown';
  };

  const getFieldName = (fieldId) => {
    const field = customFields.find(f => f.id === fieldId);
    return field ? field.name : fieldId;
  };

  const getFieldTypeDisplay = (fieldId) => {
    const field = customFields.find(f => f.id === fieldId);
    if (!field) return 'Unknown Type';
    
    // Map custom types to readable names
    const customTypeMap = {
      'com.atlassian.jira.plugin.system.customfieldtypes:select': 'Select List',
      'com.atlassian.jira.plugin.system.customfieldtypes:multiselect': 'Multi-Select List',
      'com.atlassian.jira.plugin.system.customfieldtypes:textarea': 'Multi-line Text',
      'com.atlassian.jira.plugin.system.customfieldtypes:datepicker': 'Date Picker',
      'com.atlassian.jira.plugin.system.customfieldtypes:datetime': 'Date and Time',
      'com.atlassian.jira.plugin.system.customfieldtypes:radiobuttons': 'Radio Buttons',
      'com.atlassian.jira.plugin.system.customfieldtypes:userpicker': 'User Picker',
      'com.atlassian.jira.plugin.system.customfieldtypes:multiuserpicker': 'Multi-User Picker'
    };
    
    if (customTypeMap[field.customType]) {
      return customTypeMap[field.customType];
    }
    
    // Default to standard field type
    const typeMap = {
      'string': 'Text',
      'number': 'Number',
      'date': 'Date',
      'array': 'Array',
      'option': 'Option',
      'user': 'User'
    };
    
    return typeMap[field.type] || field.type || 'Unknown Type';
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  const toggleRules = () => {
    setShowRules(!showRules);
  };

  // Conversion rules display component
  const ConversionRulesCard = () => (
    <div style={styles.conversionRulesCard}>
      <div style={styles.conversionRulesHeader}>
        <h4 style={styles.cardTitle}>Field Conversion Rules</h4>
        <button 
          style={styles.toggleButton} 
          onClick={toggleRules}
        >
          {showRules ? 'Hide Rules' : 'Show Rules'}
        </button>
      </div>
      
      {showRules && (
        <div>
          <div style={styles.validConversionItem}>
            <span style={styles.dashIcon}>✓</span>
            <span>Any field can be converted to a text field if values are under 255 characters.</span>
          </div>
          <div style={styles.validConversionItem}>
            <span style={styles.dashIcon}>✓</span>
            <span>If values are larger than 255 characters, they should be converted to a multi-line text field.</span>
          </div>
          <div style={styles.invalidConversionItem}>
            <span style={styles.dashIcon}>✗</span>
            <span>Text fields cannot be converted to select fields.</span>
          </div>
          <div style={styles.neutralConversionItem}>
            <span style={styles.dashIcon}>➤</span>
            <span>Date and time fields can be converted to date fields, but time will be set to 00:00.</span>
          </div>
          <div style={styles.validConversionItem}>
            <span style={styles.dashIcon}>✓</span>
            <span>Select fields can be converted to radio buttons.</span>
          </div>
          <div style={styles.validConversionItem}>
            <span style={styles.dashIcon}>✓</span>
            <span>Single user fields can be converted to multi-user fields.</span>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Custom Field Consolidator</h1>
        <p style={styles.description}>
          Transfer everything from one custom field to another, including screen configurations and values.
        </p>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          <h4>Error</h4>
          <p>{error}</p>
        </div>
      )}

      <div style={styles.tabList}>
        <div 
          style={activeTab === 0 ? styles.activeTab : styles.tab}
          onClick={() => handleTabChange(0)}
        >
          Consolidate Fields
        </div>
        <div 
          style={activeTab === 1 ? styles.activeTab : styles.tab}
          onClick={() => handleTabChange(1)}
        >
          Migration History
        </div>
      </div>

      {activeTab === 0 && (
        <div style={styles.tabPanel}>
          <ConversionRulesCard />

          <div style={styles.selectWrapper}>
            <label style={styles.selectLabel} htmlFor="source-field">
              Source Field (Field to migrate from)
            </label>
            <select 
              id="source-field" 
              style={styles.select}
              onChange={handleSourceFieldChange}
              value={sourceField || ''}
            >
              <option value="">Select source field...</option>
              {customFields.map(field => (
                <option key={field.id} value={field.id}>
                  {field.name} ({getFieldTypeDisplay(field.id)})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.selectWrapper}>
            <label style={styles.selectLabel} htmlFor="target-field">
              Target Field (Field to migrate to)
            </label>
            <select 
              id="target-field" 
              style={styles.select}
              onChange={handleTargetFieldChange}
              value={targetField || ''}
              disabled={!sourceField}
            >
              <option value="">Select target field...</option>
              {customFields
                .filter(field => field.id !== sourceField)
                .map(field => (
                  <option key={field.id} value={field.id}>
                    {field.name} ({getFieldTypeDisplay(field.id)})
                  </option>
                ))
              }
            </select>
          </div>

          {sourceField && targetField && validationResults && (
            <div style={validationResults.valid ? styles.successPanel : styles.warningPanel}>
              <div style={{width: '100%'}}>
                <h4 style={{margin: '0 0 8px 0'}}>
                  {validationResults.valid 
                    ? 'Compatible Field Types' 
                    : 'Warning: Incompatible Field Types'}
                </h4>
                <p style={{margin: '0 0 8px 0'}}>
                  Source field: {getFieldName(sourceField)} ({getFieldTypeDisplay(sourceField)})
                  <br />
                  Target field: {getFieldName(targetField)} ({getFieldTypeDisplay(targetField)})
                </p>
                
                {validationResults.rules.length > 0 && (
                  <div>
                    <h5 style={{margin: '8px 0', fontWeight: '500'}}>Applicable Rules:</h5>
                    {validationResults.rules.map((rule, index) => (
                      <div 
                        key={index} 
                        style={rule.valid 
                          ? styles.validConversionItem 
                          : styles.invalidConversionItem}
                      >
                        <span style={styles.dashIcon}>{rule.valid ? '✓' : '✗'}</span>
                        <span>{rule.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {configDetails && (
            <div style={{marginTop: '20px'}}>
              <h3>Field Usage Summary</h3>
              <p>The source field is used in:</p>
              <ul>
                <li>{configDetails.screens.length} screen(s)</li>
                <li>{configDetails.contexts.length} context(s)</li>
              </ul>
              
              {configDetails.screens.length > 0 && (
                <div>
                  <h4>Screens:</h4>
                  <div style={styles.flexRow}>
                    {configDetails.screens.map(screen => (
                      <div key={screen.id} style={styles.tag}>
                        {screen.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {migration && (
            <div style={{marginTop: '20px', marginBottom: '20px'}}>
              <h3>Migration Status</h3>
              <p>Started: {formatDate(migration.migrationDate)}</p>
              <p>Status: {migration.status}</p>
              
              {migration.status === 'IN_PROGRESS' && (
                <>
                  <p>Migrating issue values: {migration.issueMigrationProgress} of {migration.totalIssues}</p>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill, 
                        width: `${getMigrationProgress()}%`
                      }} 
                    />
                  </div>
                </>
              )}
              
              {migration.status === 'ERROR' && migration.error && (
                <div style={styles.errorMessage}>
                  <h4>Migration Error</h4>
                  <p>{migration.error}</p>
                </div>
              )}
              
              {migration.status === 'COMPLETED' && (
                <div style={styles.successPanel}>
                  <div>
                    <h4 style={{margin: '0 0 8px 0'}}>Migration Completed</h4>
                    <p style={{margin: 0}}>
                      Successfully migrated {migration.totalIssues} issues from {getFieldName(sourceField)} to {getFieldName(targetField)}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={styles.buttonContainer}>
            <button 
              style={
                !sourceField || 
                !targetField ||
                isAnalyzing
                  ? styles.disabledButton 
                  : styles.button
              }
              onClick={analyzeFields}
              disabled={
                !sourceField || 
                !targetField ||
                isAnalyzing
              }
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Fields'}
            </button>
            
            <button 
              style={
                !sourceField || 
                !targetField || 
                isProcessing || 
                !analysisResults ||
                (migration && migration.status === 'IN_PROGRESS') ||
                (validationResults && !validationResults.valid)
                  ? styles.disabledButton 
                  : styles.button
              }
              onClick={startConsolidation}
              disabled={
                !sourceField || 
                !targetField || 
                isProcessing || 
                !analysisResults ||
                (migration && migration.status === 'IN_PROGRESS') ||
                (validationResults && !validationResults.valid)
              }
            >
              {isProcessing ? 'Processing...' : 'Start Consolidation'}
            </button>
          </div>
          
          {validationResults && !validationResults.valid && (
            <p style={{color: '#DE350B', marginTop: '8px'}}>
              Unable to start consolidation due to incompatible field types.
            </p>
          )}
          
          {analysisResults && (
            <div style={styles.analysisSummary}>
              <h3 style={{margin: '0 0 16px 0'}}>Fields Analysis</h3>
              
              {/* Source Field Analysis */}
              <div style={styles.analysisSection}>
                <h4 style={styles.analysisHeader}>Source Field: {analysisResults.sourceField.name}</h4>
                
                <div style={styles.analysisStat}>
                  <div style={styles.analysisLabel}>Type:</div>
                  <div style={styles.analysisValue}>
                    {getFieldTypeDisplay(analysisResults.sourceField.id)}
                  </div>
                </div>
                
                <div style={styles.analysisStat}>
                  <div style={styles.analysisLabel}>Values count:</div>
                  <div style={styles.analysisValue}>
                    {analysisResults.sourceField.valueCount.toLocaleString()} issues have values
                  </div>
                </div>
                
                <div style={styles.analysisStat}>
                  <div style={styles.analysisLabel}>Screens:</div>
                  <div style={styles.analysisValue}>
                    {analysisResults.sourceField.screenCount} screens
                    <button 
                      style={styles.toggleButton}
                      onClick={() => setShowSourceScreens(!showSourceScreens)}
                    >
                      {showSourceScreens ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                
                {showSourceScreens && analysisResults.sourceField.screens.length > 0 && (
                  <div style={styles.screenList}>
                    {analysisResults.sourceField.screens.map(screen => (
                      <div key={screen.id} style={styles.screenItem}>
                        {screen.name}
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={styles.analysisStat}>
                  <div style={styles.analysisLabel}>Contexts:</div>
                  <div style={styles.analysisValue}>
                    {analysisResults.sourceField.contextCount} contexts
                  </div>
                </div>
                
                <div style={styles.analysisStat}>
                  <div style={styles.analysisLabel}>Projects:</div>
                  <div style={styles.analysisValue}>
                    {analysisResults.sourceField.projectCount} projects with data
                    {analysisResults.sourceField.hasMoreProjects && ' (showing top 100)'}
                    <button 
                      style={styles.toggleButton}
                      onClick={() => setShowSourceProjects(!showSourceProjects)}
                    >
                      {showSourceProjects ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                
                {showSourceProjects && analysisResults.sourceField.projects.length > 0 && (
                  <div style={styles.projectList}>
                    {analysisResults.sourceField.projects.map(project => (
                      <div key={project.id} style={styles.projectItem}>
                        <span>{project.name} ({project.key})</span>
                        <span>{project.count} issues</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Target Field Analysis */}
              <div style={styles.analysisSection}>
                <h4 style={styles.analysisHeader}>Target Field: {analysisResults.targetField.name}</h4>
                
                <div style={styles.analysisStat}>
                  <div style={styles.analysisLabel}>Type:</div>
                  <div style={styles.analysisValue}>
                    {getFieldTypeDisplay(analysisResults.targetField.id)}
                  </div>
                </div>
                
                <div style={styles.analysisStat}>
                  <div style={styles.analysisLabel}>Values count:</div>
                  <div style={styles.analysisValue}>
                    {analysisResults.targetField.valueCount.toLocaleString()} issues have values
                  </div>
                </div>
                
                <div style={styles.analysisStat}>
                  <div style={styles.analysisLabel}>Screens:</div>
                  <div style={styles.analysisValue}>
                    {analysisResults.targetField.screenCount} screens
                    <button 
                      style={styles.toggleButton}
                      onClick={() => setShowTargetScreens(!showTargetScreens)}
                    >
                      {showTargetScreens ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                
                {showTargetScreens && analysisResults.targetField.screens.length > 0 && (
                  <div style={styles.screenList}>
                    {analysisResults.targetField.screens.map(screen => (
                      <div key={screen.id} style={styles.screenItem}>
                        {screen.name}
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={styles.analysisStat}>
                  <div style={styles.analysisLabel}>Contexts:</div>
                  <div style={styles.analysisValue}>
                    {analysisResults.targetField.contextCount} contexts
                  </div>
                </div>
                
                <div style={styles.analysisStat}>
                  <div style={styles.analysisLabel}>Projects:</div>
                  <div style={styles.analysisValue}>
                    {analysisResults.targetField.projectCount} projects with data
                    {analysisResults.targetField.hasMoreProjects && ' (showing top 100)'}
                    <button 
                      style={styles.toggleButton}
                      onClick={() => setShowTargetProjects(!showTargetProjects)}
                    >
                      {showTargetProjects ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                
                {showTargetProjects && analysisResults.targetField.projects.length > 0 && (
                  <div style={styles.projectList}>
                    {analysisResults.targetField.projects.map(project => (
                      <div key={project.id} style={styles.projectItem}>
                        <span>{project.name} ({project.key})</span>
                        <span>{project.count} issues</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Compatibility Summary */}
              <div style={styles.analysisSection}>
                <h4 style={styles.analysisHeader}>Compatibility</h4>
                <div style={validationResults && validationResults.valid ? styles.validConversionItem : styles.invalidConversionItem}>
                  <span style={styles.dashIcon}>
                    {validationResults && validationResults.valid ? '✓' : '✗'}
                  </span>
                  <span>
                    {validationResults && validationResults.valid 
                      ? 'Fields are compatible for conversion' 
                      : 'Fields are not compatible for conversion'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 1 && (
        <div style={styles.tabPanel}>
          <h3>Previous Migrations</h3>
          
          {migrationHistory.length === 0 ? (
            <p>No migrations have been performed yet.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>From</th>
                  <th style={styles.tableHeader}>To</th>
                  <th style={styles.tableHeader}>Date</th>
                  <th style={styles.tableHeader}>Issues</th>
                </tr>
              </thead>
              <tbody>
                {migrationHistory.map((mig) => (
                  <tr key={mig.id}>
                    <td style={styles.tableCell}>
                      {getStatusIndicator(mig.status)} {mig.status}
                    </td>
                    <td style={styles.tableCell}>{getFieldName(mig.sourceFieldId)}</td>
                    <td style={styles.tableCell}>{getFieldName(mig.targetFieldId)}</td>
                    <td style={styles.tableCell}>{formatDate(mig.migrationDate)}</td>
                    <td style={styles.tableCell}>
                      {mig.issueMigrationProgress || 0}/{mig.totalIssues || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
