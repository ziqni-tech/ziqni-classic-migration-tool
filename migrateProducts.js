const { axiosGetDataInstance, getToken } = require('./axiosInstance');
const writeFile = require('./utils/writeFile')

const fetchProducts = async () => {
  let isFetched = false;
  try {
    const allProducts = [];
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
        const transformedProduct = transformProduct(record);
        allProducts.push(transformedProduct);
      }

      skip += limit;
      recordsReceived += products.length;
    }

    const entityName = 'product';
    writeFile(entityName, allProducts);

    isFetched = true;
  } catch (e) {
    console.error('Fetch products error => ', e);
  }

  if (isFetched) await createProducts()
};

function transformProduct(inputObject) {
  const metadata = inputObject.metadata ? inputObject.metadata[0] : null;
  delete metadata?.jsonClass

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
  const productData = require('./mutatedData/product/products.json');

  const api = await getToken();

  for (let i = 0; i < productData.length; i++) {
    try {
      await api.post('/products', [productData[i]]);
    } catch (e) {
      console.log('create products error', e);
    }
  }
}

fetchProducts()
