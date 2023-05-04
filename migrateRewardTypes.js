const { axiosGetDataInstance, getToken } = require('./axiosInstance');
const writeFile = require('./utils/writeFile');
const generateKeyName = require('./utils/generateKeyName');
const countErrorMessages = require('./utils/countErrorMessages');

const entityName = 'rewardTypes';

const downloadedFileName = 'downloaded';
const transformedFileName = 'transformed';
const createdFileName = 'created';
const errorFileName = 'errors';

const fetch = async () => {
  try {
    const allRewardTypes = [];
    let totalRecordsFound = 5;
    const limit = 100;
    let skip = 0;
    let recordsReceived = 0;

    while (recordsReceived < totalRecordsFound) {
      const { data } = await axiosGetDataInstance.get(`/account/reward-types?_limit=${limit}&_skip=${skip}`);

      totalRecordsFound = data.meta.totalRecordsFound;

      const rewardTypes = data.data;

      for (let i = 0; i < rewardTypes.length; i++) {
        const record = rewardTypes[i];
        allRewardTypes.push(record);
      }

      skip += limit;
      recordsReceived += rewardTypes.length;
    }

    writeFile(entityName, downloadedFileName, allRewardTypes);
  } catch (e) {
    console.error('Fetch RewardTypes error => ', e);
  }
};

const transform = async () => {
  const allRewardTypes = require(`./entitiesData/${entityName}/downloaded.json`);
  const api = await getToken();

  const { data: resultsData } = await api.post('/custom-fields/query', {
    limit: null,
    skip: 0,
    multiFields: [
      {
        queryFields: ['appliesTo'],
        queryValue: 'UnitOfMeasure'
      }
    ]
  });

  const unitsOfMeasureCustomFields = await resultsData.results.reduce((acc, obj) => {
    acc[obj['key']] = null;
    return acc;
  }, {});

  const unitsOfMeasureKey = generateKeyName();

  const unitOfMeasure = {
    customFields: unitsOfMeasureCustomFields,
    tags: [],
    metadata: {},
    name: 'AUTO-GENERATED',
    key: unitsOfMeasureKey,
    description: 'AUTO-GENERATED',
    isoCode: 'USD',
    symbol: '$',
    multiplier: '1',
    unitOfMeasureType: 'Other'
  };

  let unitsOfMeasureId = null;

  try {
    const { data } = await api.post('/units-of-measure', [unitOfMeasure]);

    if (data.errors) {
      data.errors.forEach(item => {
        console.log('Create UnitsOfMeasure Error => ', item.detail);
      });
    }

    if (data.results.length) {
      unitsOfMeasureId = data.results[0].id;
    }
  } catch (e) {
    console.log('Create UnitsOfMeasure error', e);
  }

  const { data: rewardTypeCustomFieldsData } = await api.post('/custom-fields/query', {
    limit: null,
    skip: 0,
    multiFields: [
      {
        queryFields: ['appliesTo'],
        queryValue: 'RewardType'
      }
    ]
  });

  const rewardTypeCustomFields = await rewardTypeCustomFieldsData.results.reduce((acc, obj) => {
    acc[obj['key']] = null;
    return acc;
  }, {});

  const rewardTypesWithCustomFields = [];

  for (let i = 0; i < allRewardTypes.length; i++) {
    const record = allRewardTypes[i];
    const transformedRewardTypes = transformRewardTypes(record, rewardTypeCustomFields, unitsOfMeasureId);
    rewardTypesWithCustomFields.push(transformedRewardTypes);
  }

  writeFile(entityName, transformedFileName, rewardTypesWithCustomFields);
};

function transformRewardTypes(inputObject, customFields, unitOfMeasure) {
  const metadata = inputObject.metadata && inputObject.metadata.length
    ? inputObject.metadata.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {})
    : null;

  const constraints = [];
  if (inputObject.system === true) constraints.push('system');

  return {
    customFields: customFields,
    tags: [],
    metadata: metadata,
    name: inputObject.name,
    key: inputObject.key,
    unitOfMeasure: unitOfMeasure,
    translations: [],
    addConstraints: constraints
  };
}

async function create() {
  const rewardTypesData = require(`./entitiesData/${entityName}/transformed.json`);

  const createdRewardTypes = [];
  const errors = [];

  for (let i = 0; i < rewardTypesData.length; i++) {
    try {
      const api = await getToken();

      const { data } = await api.post('/reward-types', [rewardTypesData[i]]);

      if (data.errors) {
        data.errors.forEach(item => {
          console.log('Create Reward Type Error => ', item.detail);
        });
      }

      if (data.errors.length) {
        const error = {
          name: rewardTypesData[i].name,
          key: rewardTypesData[i].key,
          errors: data.errors
        };
        errors.push(error);

      }

      if (data.results.length) {
        createdRewardTypes.push(data.results[0]);
      }
    } catch (e) {
      console.log('Create RewardTypes error', e);
    }
  }

  if (errors.length) {
    console.log('errors', errors.length);
    const countErrors = countErrorMessages(errors)
    console.log('errors', countErrors);
    writeFile(entityName, errorFileName, errors);
  }

  if (createdRewardTypes.length) {
    console.log('Create RewardTypes - ', createdRewardTypes.length);
    writeFile(entityName, createdFileName, createdRewardTypes);
  }
}

const args = process.argv.slice(2);

if (args.length > 0) {
  switch (args[0]) {
    case 'create':
      create();
      break;
    case 'transform':
      transform();
      break;
    case 'fetch':
      fetch();
      break;
  }
} else {
  console.log('You must specify the function name (create / transform / fetch) in the command line argument! ' +
    'For example - node fileName.js create');
}
