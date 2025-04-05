# Jira Custom Field Consolidator

A Forge app for Atlassian Jira that allows administrators to consolidate two custom fields by transferring all configurations and values from one to another.

## Features

- Select any two custom fields for consolidation (even fields of different types)
- Transfer all configuration settings:
  - Screen associations
  - Context configurations
  - Field values across all issues
- View detailed progress of the migration process
- Review history of past consolidations

## Use Cases

- Consolidate duplicate fields created by different teams or admins
- Replace deprecated custom fields with new ones
- Transfer data to a field with better configuration options
- Clean up field clutter in your Jira instance

## Installation

The app can be installed directly from the Atlassian Marketplace. Once installed:

1. Navigate to Jira Administration > Apps > Custom Field Consolidator
2. Select the source field (the field you want to migrate from)
3. Select the target field (the field you want to migrate to)
4. Review the field usage summary and any warnings
5. Click "Start Consolidation" to begin the process

## Development

This app is built with Atlassian Forge. To develop:

```bash
# Install Forge CLI globally
npm install -g @forge/cli

# Register the app (only needed on first run)
forge register

# Install dependencies for backend
npm install

# Install dependencies for frontend
cd static/main
npm install

# Build the frontend
npm run build
cd ../..

# Deploy the app
forge deploy

# Install the app on your development site
forge install
```

## How It Works

The app uses several Atlassian REST APIs to perform the consolidation:

1. **Field Discovery**: Fetches all custom fields from the Jira instance
2. **Field Usage Analysis**: Determines which screens, contexts, and issues use the source field
3. **Configuration Transfer**: Adds the target field to all screens and contexts where the source field is used
4. **Value Migration**: Transfers all field values from the source field to the target field
5. **Progress Tracking**: Monitors and displays the progress of the migration

## Security and Performance

- All operations are performed through the Forge runtime with appropriate permissions
- Field values are migrated in batches to avoid performance issues
- The app uses Atlassian's secure storage to track migration progress
- All actions are performed in the context of the app, not the user

## Warnings

- Different field types may not be fully compatible for value transfer
- The app does not delete the source field after migration to avoid data loss
- Some complex field configurations (like cascading select relationships) may require manual review

## Support

For support, feature requests, or bug reports, please contact us through the Marketplace listing or submit an issue on our GitHub repository.

## License

This app is licensed under the Apache License 2.0 - see the LICENSE file for details.
