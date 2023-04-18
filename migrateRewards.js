const { axiosGetDataInstance, axiosPostDataInstance } = require('./axiosInstance');
const writeFile = require('./utils/writeFile');
const capitalize = require('./utils/capitalize');

const fetchProducts = async () => {
  let isFetched = false;
  try {
    const allRewards = [];
    let totalRecordsFound = 5;
    const limit = 100;
    let skip = 0;
    let recordsReceived = 0;

    while (recordsReceived < totalRecordsFound) {
      const { data } = await axiosGetDataInstance.get(`/reward?_limit=${limit}&_skip=${skip}`);

      totalRecordsFound = data.meta.totalRecordsFound;

      const members = data.data;

      for (let i = 0; i < members.length; i++) {
        const record = members[i];
        const transformedReward = transformReward(record);
        allRewards.push(transformedReward);
      }

      skip += limit;
      recordsReceived += members.length;
    }

    const entityName = 'reward';
    writeFile(entityName, allRewards);

    isFetched = true;
  } catch (e) {
    console.error('Fetch rewards error => ', e);
  }

  // if (isFetched) await createRewards();
};

function transformReward(inputObject) {
  const metadata = inputObject.metadata ? inputObject.metadata[0] : null;
  delete metadata?.jsonClass

  return {
    customFields: {},
    tags: [],
    metadata: {},
    entityType: capitalize(inputObject.entityType),
    entityId: inputObject.entityId,
    name: inputObject.rewardName,
    description: inputObject.description,
    rewardRank: inputObject.rewardRank,
    rewardValue: inputObject.value,
    icon: '',
    issueLimit: '',
    delay: inputObject.delay,
    pointInTime: inputObject.pointInTime,
    period: inputObject.period,
    translations: [],
    constraints: '',
    rewardTypeId: inputObject.rewardType
  };
}

async function createRewards() {
  const rewardData = require('./mutatedData/reward/rewards.json');

  for (let i = 0; i < rewardData.length; i++) {
    try {
      const { data } = await axiosPostDataInstance.post('/rewards', [rewardData[i]])
    } catch (e) {
      console.log('create rewards error', e);
    }
  }
}

fetchProducts()

