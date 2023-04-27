const { axiosGetDataInstance, getToken } = require('./axiosInstance');
const writeFile = require('./utils/writeFile');

const entityName = 'unitsOfMeasure';

const downloadedFileName = 'downloaded';
const transformedFileName = 'transformed';
const createdFileName = 'created';
const errorFileName = 'errors';

const fetch = async () => {
  try {
    const allUnitsOfMeasure = [];
    let totalRecordsFound = 5;
    const limit = 100;
    let skip = 0;
    let recordsReceived = 0;

    while (recordsReceived < totalRecordsFound) {
      const { data } = await axiosGetDataInstance.get(`/unitofmeasure?_limit=${limit}&_skip=${skip}`);

      totalRecordsFound = data.meta.totalRecordsFound;

      const unitsOfMeasure = data.data;

      for (let i = 0; i < unitsOfMeasure.length; i++) {
        const record = unitsOfMeasure[i];
        allUnitsOfMeasure.push(record);
      }

      skip += limit;
      recordsReceived += unitsOfMeasure.length;
    }
    writeFile(entityName, downloadedFileName, allUnitsOfMeasure);
  } catch (e) {
    console.error('Fetch UnitsOfMeasure error => ', e);
  }
};

const transform = async () => {
  const allUnitsOfMeasure = require(`./entitiesData/${entityName}/downloaded.json`);
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

  const customFields = await resultsData.results.reduce((acc, obj) => {
    acc[obj['key']] = null;
    return acc;
  }, {});

  const unitOfMeasureWithCustomFields = [];

  for (let i = 0; i < allUnitsOfMeasure.length; i++) {
    const record = allUnitsOfMeasure[i];
    const transformedUnitsOfMeasure = transformUnitsOfMeasure(record, customFields);
    unitOfMeasureWithCustomFields.push(transformedUnitsOfMeasure);
  }

  writeFile(entityName, transformedFileName, unitOfMeasureWithCustomFields);
};

function transformUnitsOfMeasure(inputObject, customFields) {
  const metadata = inputObject.metadata.length
    ? inputObject.metadata.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {})
    : null;

  return {
    name: inputObject.name,
    key: inputObject.key,
    tags: null,
    multiplier: inputObject.multiplier,
    unitOfMeasureType: inputObject.unitOfMeasureType,
    isoCode: inputObject.isoCode.length ? inputObject.isoCode : null,
    symbol: inputObject.symbol.length ? inputObject.symbol : null,
    description: inputObject.description.length ? inputObject.description : null,
    customFields: customFields,
    metadata: metadata
  };
}

async function create() {
  const unitsOfMeasureData = require(`./entitiesData/${entityName}/transformed.json`);

  const createdUnitsOfMeasure = [];
  const errors = [];

  for (let i = 0; i < unitsOfMeasureData.length; i++) {
    try {
      const api = await getToken();

      const { data } = await api.post('/units-of-measure', [unitsOfMeasureData[i]]);

      if (data.errors) {
        data.errors.forEach(item => {
          console.log('Create UnitsOfMeasure Error => ', item.detail);
        });
      }

      if (data.results.length) {
        createdUnitsOfMeasure.push(data.results[0]);
      }
    } catch (e) {
      console.log('Create UnitsOfMeasure error', e);
    }
  }

  console.log('unitsOfMeasureData', unitsOfMeasureData.length);

  if (errors.length) {
    console.log('errors', errors.length);
    writeFile(entityName, errorFileName, errors);
  }

  if (createdUnitsOfMeasure.length) {
    console.log('copied UnitsOfMeasure', createdUnitsOfMeasure.length);
    writeFile(entityName, createdFileName, createdUnitsOfMeasure);
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
