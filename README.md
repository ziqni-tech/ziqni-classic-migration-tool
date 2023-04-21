# ziqni-classic-migration-tool

## Description
This project is a data migration tool that allows you to copy data from an old platform to a new platform. It provides a command-line interface (CLI) for fetching data from the old platform, transforming it into the required format for the new platform, and creating data on the new platform using the transformed data. This tool is useful when you need to transfer data from one platform to another, such as during a system upgrade or migration.

## Installation
1. Clone this repository to your local machine.
   https://github.com/ziqni-tech/ziqni-classic-migration-tool
2. Install the required dependencies by running `npm install` in the project directory.

## Usage
### Migration Steps
Step 1: Set up Credentials
1. In your repository, locate the file named `.env.example`.
2. Rename it to `.env` or create a new file with the same name.
3. Fill in the following credentials in the `.env` file:
    - GET_DATA_URL: URL of the old platform.
    - GET_DATA_SPACE: Space name from which you want to copy the data.
    - GET_DATA_ADMIN_API_KEY: API key of the user with the administrator role for this space on the old platform.
    - POST_DATA_URL: URL of the new platform.
    - POST_DATA_SPACE: Space name to which you want to save the data.
    - USER_NAME: Credentials to log in to the new platform.
    - PASSWORD: Credentials to log in to the new platform.

Step 2: Fetch Data from the Old Platform
1. Run the command `node migrate(Entity)s.js fetch` to copy the data from the old platform.
2. The fetched data will be saved in a JSON file, the path of which will be displayed in the console.
3. Review the contents of this JSON file to ensure the data has been copied correctly.

Step 3: Transform Data
1. If the fetched data is correct, you can transform it to the required format for the new platform.
2. Run the command `node migrate(Entity)s.js transform` to perform the transformation.
3. The transformed data will be saved in a JSON file that you can review to ensure it is in the correct format.

Step 4: Create Data on the New Platform
1. After confirming that the transformed data is correct, you can upload it to the new platform.
2. Run the command `node migrate(Entity)s.js create` to create the data on the new platform using the transformed data.

Note: Create UnitOfMeasure Entity

For migrating data for the RewardType entity, which requires a `unitOfMeasure: "ziqniModelId"` field on the new platform, create a new entity UnitOfMeasure with the name and description "AUTO-GENERATED".
Use the ID of this UnitOfMeasure entity for creating all the migrated RewardType entities on the new platform.
