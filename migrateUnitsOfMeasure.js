const { axiosGetDataInstance, getToken } = require('./axiosInstance');
const writeFile = require('./utils/writeFile')

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
        // const transformedUnitsOfMeasure = transformUnitsOfMeasure(record);
        allUnitsOfMeasure.push(record);
      }

      skip += limit;
      recordsReceived += unitsOfMeasure.length;
    }

    const entityName = 'unitsOfMeasure';
    writeFile(entityName, allUnitsOfMeasure);

    isFetched = true;
  } catch (e) {
    console.error('Fetch UnitsOfMeasure error => ', e);
  }

  // if (isFetched) await createUnitsOfMeasure()
};

function transformUnitsOfMeasure(inputObject) {
  const metadata = inputObject.metadata ? inputObject.metadata[0] : null;
  delete metadata?.jsonClass

  return {

  };
}

async function createUnitsOfMeasure() {
  const unitsOfMeasureData = require('./mutatedData/unitsOfMeasure/unitsOfMeasure.json');

  const api = await getToken();

  for (let i = 0; i < unitsOfMeasureData.length; i++) {
    try {
      await api.post('/', [unitsOfMeasureData[i]]);
    } catch (e) {
      console.log('create UnitsOfMeasure error', e);
    }
  }
}

fetchUnitsOfMeasure()
