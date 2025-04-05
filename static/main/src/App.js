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
  }
};

function FullApp() {
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

  const getFieldName = (fieldId) => {
    const field = customFields.find(f => f.id === fieldId);
    return field ? field.name : fieldId;
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

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
                  {field.name} ({field.type})
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
                    {field.name} ({field.type})
                  </option>
                ))
              }
            </select>
          </div>

          {sourceField && targetField && getFieldType(sourceField) !== getFieldType(targetField) && (
            <div style={styles.warningPanel}>
              <div>
                <h4 style={{margin: '0 0 8px 0'}}>Warning: Different Field Types</h4>
                <p style={{margin: 0}}>
                  The source field ({getFieldType(sourceField)}) and target field ({getFieldType(targetField)}) have different types.
                  Some values may not transfer correctly.
                </p>
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

          <button 
            style={!sourceField || !targetField || isProcessing || (migration && migration.status === 'IN_PROGRESS') ? styles.disabledButton : styles.button}
            onClick={startConsolidation}
            disabled={!sourceField || !targetField || isProcessing || (migration && migration.status === 'IN_PROGRESS')}
          >
            {isProcessing ? 'Processing...' : 'Start Consolidation'}
          </button>
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

export default FullApp;
