const { axiosGetDataInstance, getToken } = require('./axiosInstance');
const writeFile = require('./utils/writeFile');

const entityName = 'unitsOfMeasure';

const downloadedFileName = 'downloadedFromOldPlatform';
const transformedFileName = 'transformed';
const createdFileName = 'createdOnNewPlatform';

const fetchUnitsOfMeasure = async () => {
  let isFetched = false;
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

    writeFile(entityName, downloadedFileName, allUnitsOfMeasure);
    writeFile(entityName, transformedFileName, unitOfMeasureWithCustomFields);

    isFetched = true;
  } catch (e) {
    console.error('Fetch UnitsOfMeasure error => ', e);
  }

  if (isFetched) await createUnitsOfMeasure();
};

function transformUnitsOfMeasure(inputObject, customFields) {
  const metadata = inputObject.metadata ? inputObject.metadata[0] : null;
  delete metadata?.jsonClass;

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
    metadata: null
  };
}

async function createUnitsOfMeasure() {
  const unitsOfMeasureData = require(`./entitiesData/${entityName}/transformed.json`);

  const api = await getToken();
  const createdUnitsOfMeasure = [];

  for (let i = 0; i < unitsOfMeasureData.length; i++) {
    try {
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

  writeFile(entityName, createdFileName, createdUnitsOfMeasure);
}

fetchUnitsOfMeasure();
