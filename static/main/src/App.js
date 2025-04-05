import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import '@atlaskit/css-reset';
// Importando componentes Atlaskit individualmente com um alias para evitar conflitos de CSP
import Button from '@atlaskit/button';
import { Tabs, Tab, TabList, TabPanel } from '@atlaskit/tabs';
import Select from '@atlaskit/select';
import Tag from '@atlaskit/tag';
import Spinner from '@atlaskit/spinner';
import ProgressBar from '@atlaskit/progress-bar';
// Usando as importações de ícones como um ícone único para evitar problemas de CSP
import { WarningIcon, CheckCircleIcon, ErrorIcon, InfoIcon } from '@atlaskit/icon';
// Usando CSS em arquivo separado em vez de styled-components
import './styles.css';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 20px;
  border-bottom: 1px solid #dfe1e6;
  padding-bottom: 15px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const Description = styled.p`
  color: #6b778c;
  margin-bottom: 15px;
`;

const SelectWrapper = styled.div`
  margin-bottom: 15px;
`;

const SelectLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 10px;
`;

const InfoPanel = styled.div`
  background-color: ${props => props.backgroundColor || '#DEEBFF'};
  border-radius: 3px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
`;

const InfoContent = styled.div`
  margin-left: 12px;
`;

const InfoTitle = styled.h4`
  margin: 0 0 4px;
  font-weight: 500;
`;

const InfoMessage = styled.p`
  margin: 0;
  color: #344563;
`;

const MigrationHistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid #DFE1E6;
  font-weight: 500;
`;

const TableCell = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid #DFE1E6;
`;

const App = () => {
  const [customFields, setCustomFields] = useState([]);
  const [sourceField, setSourceField] = useState(null);
  const [targetField, setTargetField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configDetails, setConfigDetails] = useState(null);
  const [migration, setMigration] = useState(null);
  const [migrationHistory, setMigrationHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        const fields = await invoke('getCustomFields');
        if (fields.error) {
          setError(fields.error);
        } else {
          setCustomFields(fields);
        }
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    const fetchMigrationHistory = async () => {
      try {
        const history = await invoke('getMigrationHistory');
        if (history.error) {
          setError(history.error);
        } else {
          setMigrationHistory(history);
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchCustomFields();
    fetchMigrationHistory();
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
      const details = await invoke('getFieldConfigurations', { 
        sourceFieldId: sourceField.value 
      });
      if (details.error) {
        setError(details.error);
      } else {
        setConfigDetails(details);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const startConsolidation = async () => {
    try {
      setError(null);
      const result = await invoke('startConsolidation', {
        sourceFieldId: sourceField.value,
        targetFieldId: targetField.value
      });
      
      if (result.error) {
        setError(result.error);
      } else {
        checkMigrationStatus(result.migrationId);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const checkMigrationStatus = async (migrationId) => {
    try {
      const currentMigrationId = migrationId || (migration ? migration.migrationId : null);
      if (!currentMigrationId) return;
      
      const status = await invoke('getMigrationStatus', {
        migrationId: currentMigrationId
      });
      
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
    } catch (error) {
      setError(error.message);
    }
  };

  const getMigrationProgress = () => {
    if (!migration) return 0;
    if (migration.totalIssues === 0) return 0;
    return (migration.issueMigrationProgress / migration.totalIssues) * 100;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon primaryColor="green" />;
      case 'IN_PROGRESS':
        return <Spinner size="small" />;
      case 'ERROR':
        return <ErrorIcon primaryColor="red" />;
      default:
        return <InfoIcon primaryColor="blue" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
          <Spinner size="large" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Custom Field Consolidator</Title>
        <Description>
          Transfer everything from one custom field to another, including screen configurations and values.
        </Description>
      </Header>

      {error && (
        <InfoPanel backgroundColor="#FFEBE6">
          <ErrorIcon primaryColor="#DE350B" />
          <InfoContent>
            <InfoTitle>Error</InfoTitle>
            <InfoMessage>{error}</InfoMessage>
          </InfoContent>
        </InfoPanel>
      )}

      <Tabs onChange={handleTabChange} selected={activeTab}>
        <TabList>
          <Tab>Consolidate Fields</Tab>
          <Tab>Migration History</Tab>
        </TabList>

        <TabPanel>
          <SelectWrapper>
            <SelectLabel htmlFor="source-field">Source Field (Field to migrate from)</SelectLabel>
            <Select
              inputId="source-field"
              className="single-select"
              classNamePrefix="react-select"
              options={customFields.map(field => ({
                label: `${field.name} (${field.type})`,
                value: field.id,
                type: field.type,
                customType: field.customType
              }))}
              placeholder="Select source field..."
              onChange={setSourceField}
              value={sourceField}
            />
          </SelectWrapper>

          <SelectWrapper>
            <SelectLabel htmlFor="target-field">Target Field (Field to migrate to)</SelectLabel>
            <Select
              inputId="target-field"
              className="single-select"
              classNamePrefix="react-select"
              options={customFields
                .filter(field => field.id !== (sourceField ? sourceField.value : null))
                .map(field => ({
                  label: `${field.name} (${field.type})`,
                  value: field.id,
                  type: field.type,
                  customType: field.customType
                }))}
              placeholder="Select target field..."
              onChange={setTargetField}
              value={targetField}
              isDisabled={!sourceField}
            />
          </SelectWrapper>

          {sourceField && targetField && sourceField.type !== targetField.type && (
            <InfoPanel backgroundColor="#FFFAE6">
              <WarningIcon primaryColor="#FFAB00" />
              <InfoContent>
                <InfoTitle>Warning: Different Field Types</InfoTitle>
                <InfoMessage>
                  The source field ({sourceField.type}) and target field ({targetField.type}) have different types.
                  Some values may not transfer correctly.
                </InfoMessage>
              </InfoContent>
            </InfoPanel>
          )}

          {configDetails && (
            <div style={{ marginTop: '20px' }}>
              <h3>Field Usage Summary</h3>
              <p>The source field is used in:</p>
              <ul>
                <li>{configDetails.screens.length} screen(s)</li>
                <li>{configDetails.contexts.length} context(s)</li>
              </ul>
              
              {configDetails.screens.length > 0 && (
                <div>
                  <h4>Screens:</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {configDetails.screens.map(screen => (
                      <Tag key={screen.id} text={screen.name} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {migration && (
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <h3>Migration Status</h3>
              <p>Started: {formatDate(migration.migrationDate)}</p>
              <p>Status: {migration.status}</p>
              
              {migration.status === 'IN_PROGRESS' && (
                <>
                  <p>Migrating issue values: {migration.issueMigrationProgress} of {migration.totalIssues}</p>
                  <ProgressBar value={getMigrationProgress()} />
                </>
              )}
              
              {migration.status === 'ERROR' && migration.error && (
                <InfoPanel backgroundColor="#FFEBE6">
                  <ErrorIcon primaryColor="#DE350B" />
                  <InfoContent>
                    <InfoTitle>Migration Error</InfoTitle>
                    <InfoMessage>{migration.error}</InfoMessage>
                  </InfoContent>
                </InfoPanel>
              )}
              
              {migration.status === 'COMPLETED' && (
                <InfoPanel backgroundColor="#E3FCEF">
                  <CheckCircleIcon primaryColor="#00875A" />
                  <InfoContent>
                    <InfoTitle>Migration Completed</InfoTitle>
                    <InfoMessage>
                      Successfully migrated {migration.totalIssues} issues from {sourceField?.label} to {targetField?.label}.
                    </InfoMessage>
                  </InfoContent>
                </InfoPanel>
              )}
            </div>
          )}

          <ButtonGroup>
            <Button 
              appearance="primary"
              onClick={startConsolidation}
              isDisabled={!sourceField || !targetField || (migration && migration.status === 'IN_PROGRESS')}
            >
              Start Consolidation
            </Button>
          </ButtonGroup>
        </TabPanel>

        <TabPanel>
          <h3>Previous Migrations</h3>
          
          {migrationHistory.length === 0 ? (
            <p>No migrations have been performed yet.</p>
          ) : (
            <MigrationHistoryTable>
              <thead>
                <tr>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>From</TableHeader>
                  <TableHeader>To</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Issues</TableHeader>
                </tr>
              </thead>
              <tbody>
                {migrationHistory.map((mig) => {
                  const sourceField = customFields.find(f => f.id === mig.sourceFieldId);
                  const targetField = customFields.find(f => f.id === mig.targetFieldId);
                  
                  return (
                    <tr key={mig.id}>
                      <TableCell>
                        {getStatusIcon(mig.status)} {mig.status}
                      </TableCell>
                      <TableCell>{sourceField ? sourceField.name : mig.sourceFieldId}</TableCell>
                      <TableCell>{targetField ? targetField.name : mig.targetFieldId}</TableCell>
                      <TableCell>{formatDate(mig.migrationDate)}</TableCell>
                      <TableCell>
                        {mig.issueMigrationProgress || 0}/{mig.totalIssues || 0}
                      </TableCell>
                    </tr>
                  );
                })}
              </tbody>
            </MigrationHistoryTable>
          )}
        </TabPanel>
      </Tabs>
    </Container>
  );
};

export default App;
