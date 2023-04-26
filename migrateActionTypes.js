const { axiosGetDataInstance, getToken } = require('./axiosInstance');
const writeFile = require('./utils/writeFile');
const generateKeyName = require('./utils/generateKeyName');

const entityName = 'actionTypes';

const downloadedFileName = 'downloaded';
const transformedFileName = 'transformed';
const createdFileName = 'created';
const errorFileName = 'errors';

const fetch = async () => {
  try {
    const allActionTypes = [];
    let totalRecordsFound = 5;
    const limit = 100;
    let skip = 0;
    let recordsReceived = 0;

    while (recordsReceived < totalRecordsFound) {
      const { data } = await axiosGetDataInstance.get(`/account/rule-action-helper?_limit=${limit}&_skip=${skip}`);

      totalRecordsFound = data.meta.totalRecordsFound;

      const actionTypes = data.data;

      for (let i = 0; i < actionTypes.length; i++) {
        const record = actionTypes[i];
        allActionTypes.push(record);
      }

      skip += limit;
      recordsReceived += actionTypes.length;
    }

    writeFile(entityName, downloadedFileName, allActionTypes);
  } catch (e) {
    console.error('Fetch ActionTypes error => ', e);
  }
};

const transform = async () => {
  const allActionTypes = require(`./entitiesData/${entityName}/downloaded.json`);
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

  const { data: actionTypeCustomFieldsData } = await api.post('/custom-fields/query', {
    limit: null,
    skip: 0,
    multiFields: [
      {
        queryFields: ['appliesTo'],
        queryValue: 'ActionType'
      }
    ]
  });

  const actionTypeCustomFields = await actionTypeCustomFieldsData.results.reduce((acc, obj) => {
    acc[obj['key']] = null;
    return acc;
  }, {});

  const actionTypesWithCustomFields = [];

  for (let i = 0; i < allActionTypes.length; i++) {
    const record = allActionTypes[i];
    const transformedActionType = transformRewardTypes(record, actionTypeCustomFields, unitsOfMeasureId);
    actionTypesWithCustomFields.push(transformedActionType);
  }

  writeFile(entityName, transformedFileName, actionTypesWithCustomFields);
};

function transformRewardTypes(inputObject, customFields, unitOfMeasure) {
  const metadata = inputObject.metadata ? inputObject.metadata[0] : null;
  delete metadata?.jsonClass;

  const constraints = [];
  if (inputObject.system === true) constraints.push('system');

  return {
    addConstraints: constraints,
    description: inputObject.description,
    key: inputObject.key,
    name: inputObject.name,
    unitOfMeasure: unitOfMeasure,
    customFields: customFields,
    tags: [],
    metadata: metadata
  }
}

async function create() {
  const actionTypesData = require(`./entitiesData/${entityName}/transformed.json`);

  const createdActionTypes = [];
  const errors = [];

  for (let i = 1; i < actionTypesData.length; i++) {
    try {
      const api = await getToken();

      const { data } = await api.post('/action-types', [actionTypesData[i]]);

      if (data.errors) {
        data.errors.forEach(item => {
          console.log('Create Action Type Error => ', item.detail);
        });
      }

      if (data.errors.length) {
        const error = {
          name: actionTypesData[i].name,
          key: actionTypesData[i].key,
          errors: data.errors
        };
        errors.push(error);

      }

      if (data.results.length) {
        createdActionTypes.push(data.results[0]);
      }
    } catch (e) {
      console.log('Create ActionTypes error', e);
    }
  }

  if (errors.length) {
    console.log('errors', errors.length);
    writeFile(entityName, errorFileName, errors);
  }

  if (createdActionTypes.length) {
    console.log('Created ActionTypes - ', createdActionTypes.length);
    writeFile(entityName, createdFileName, createdActionTypes);
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
