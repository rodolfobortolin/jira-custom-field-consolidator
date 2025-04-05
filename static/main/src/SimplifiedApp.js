import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';

// CSS incorporado diretamente no componente, sem usar styled-components
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
    fontWeight: '500'
  },
  errorMessage: {
    backgroundColor: '#FFEBE6',
    color: '#DE350B',
    padding: '10px',
    borderRadius: '3px',
    marginBottom: '16px'
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
  }
};

function SimplifiedApp() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Application initialized');
        
        // Simple test to verify the app renders correctly
        const testData = await invoke('getCustomFields');
        console.log('Data received:', testData);
        setData(testData);
        setLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to initialize');
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Custom Field Consolidator</h1>
        <p style={styles.description}>This application helps you consolidate custom fields in Jira.</p>
      </div>
      
      {data && data.length > 0 ? (
        <div>
          <h3>Available Custom Fields</h3>
          <p>Found {data.length} custom fields in your Jira instance.</p>
          
          <ul style={styles.fieldList}>
            {data.slice(0, 5).map(field => (
              <li key={field.id} style={styles.fieldItem}>
                {field.name} ({field.type})
              </li>
            ))}
            {data.length > 5 && <li style={styles.fieldItem}>...and {data.length - 5} more</li>}
          </ul>
          
          <button 
            style={styles.button}
            onClick={() => console.log('Button clicked')}
          >
            Continue to Full Application
          </button>
        </div>
      ) : (
        <p>No custom fields found or not yet loaded.</p>
      )}
    </div>
  );
}

export default SimplifiedApp;
