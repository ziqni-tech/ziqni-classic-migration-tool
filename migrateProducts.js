const { axiosGetDataInstance, getToken } = require('./axiosInstance');
const writeFile = require('./utils/writeFile');

const entityName = 'product';

const downloadedFileName = 'downloaded';
const transformedFileName = 'transformed';
const createdFileName = 'created';
const errorFileName = 'errors';

const fetch = async () => {
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
        allProducts.push(record);
      }

      skip += limit;
      recordsReceived += products.length;
    }

    writeFile(entityName, downloadedFileName, allProducts);
  } catch (e) {
    console.error('Fetch products error => ', e);
  }
};

const transform = async () => {
  const allProducts = require(`./entitiesData/${entityName}/downloaded.json`);

  const refIdCount = {};

  for (const product of allProducts) {
    const productRefId = product.productRefId;

    if (productRefId) {
      const num = parseInt(productRefId.replace('Some(', '').replace(')', ''));

      if (num) {
        refIdCount[num] = (refIdCount[num] || 0) + 1;
      }
    }
  }

  for (const product of allProducts) {
    const productRefId = product.productRefId;

    if (productRefId) {
      const num = parseInt(productRefId.replace('Some(', '').replace(')', ''));

      if (num && refIdCount[num] === 1) {
        product.productRefId = num.toString();
      }
    }
  }


  const transformedMembers = [];
  for (let i = 0; i < allProducts.length; i++) {
    const record = allProducts[i];
    const transformedMember = transformProduct(record);
    transformedMembers.push(transformedMember);
  }

  writeFile(entityName, transformedFileName, transformedMembers);
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

async function create() {
  const productData = require(`./entitiesData/${entityName}/transformed.json`);

  const createdProducts = [];
  const errors = [];

  for (let i = 0; i < productData.length; i++) {
    try {
      const api = await getToken();

      const { data } = await api.post('/products', [productData[i]]);

      if (data.errors.length) {
        const error = {
          name: productData[i].name,
          productRefId: productData[i].productRefId,
          errors: data.errors
        };
        errors.push(error);

      }

      if (data.results.length) {
        createdProducts.push(data.results[0]);
      }
    } catch (e) {
      console.log('create products error', e);
    }
  }

  console.log('productData', productData.length);

  if (errors.length) {
    console.log('errors', errors.length);
    writeFile(entityName, errorFileName, errors);
  }

  if (createdProducts.length) {
    console.log('copied products', createdProducts.length);
    writeFile(entityName, createdFileName, createdProducts);
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
