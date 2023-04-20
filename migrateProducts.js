const { axiosGetDataInstance, getToken } = require('./axiosInstance');
const writeFile = require('./utils/writeFile');

const entityName = 'product';

const downloadedFileName = 'downloadedFromOldPlatform';
const transformedFileName = 'transformed';
const createdFileName = 'createdOnNewPlatform';

const fetchProducts = async () => {
  let isFetched = false;
  try {
    const allProducts = [];
    const transformedProducts = [];
    let totalRecordsFound = 5;
    const limit = 100;
    let skip = 0;
    let recordsReceived = 0;

    while (recordsReceived < totalRecordsFound) {
      const { data } = await axiosGetDataInstance.get(`/products?_limit=${limit}&_skip=${skip}`);

      totalRecordsFound = data.meta.totalRecordsFound;

      const products = data.data;

      for (let i = 0; i < products.length; i++) {
        const record = products[i];
        allProducts.push(record);

        const transformedProduct = transformProduct(record);
        transformedProducts.push(transformedProduct);
      }

      skip += limit;
      recordsReceived += products.length;
    }

    writeFile(entityName, downloadedFileName, allProducts);
    writeFile(entityName, transformedFileName, transformedProducts);

    isFetched = true;
  } catch (e) {
    console.error('Fetch products error => ', e);
  }

  if (isFetched) await createProducts();
};

function transformProduct(inputObject) {
  const metadata = inputObject.metadata ? inputObject.metadata[0] : null;
  delete metadata?.jsonClass;

  return {
    productRefId: inputObject.productRefId,
    name: inputObject.name,
    description: inputObject.description,
    adjustmentFactor: inputObject.adjustmentFactor,
    actionTypeAdjustmentFactors: inputObject.actionTypeAdjustmentFactors ?? null,
    customFields: inputObject.customFields ?? null,
    metadata: metadata,
    tags: inputObject.tags ?? null,
    translations: inputObject.translations ?? null,
    productType: inputObject.productType ?? null
  };
}

async function createProducts() {
  const productData = require(`./entitiesData/${entityName}/transformed.json`);

  const api = await getToken();
  const createdProducts = [];

  for (let i = 0; i < productData.length; i++) {
    try {
      const { data } = await api.post('/products', [productData[i]]);

      if (data.errors) {
        data.errors.forEach(item => {
          console.log('Create product Error => ', item.detail);
        });
      }

      if (data.results.length) {
        createdProducts.push(data.results[0]);
      }
    } catch (e) {
      console.log('create products error', e);
    }
  }

  writeFile(entityName, createdFileName, createdProducts);
}

fetchProducts();
