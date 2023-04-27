const { axiosGetDataInstance, getToken } = require('./axiosInstance');
const writeFile = require('./utils/writeFile');
const capitalizeFirstLetter = require('./utils/capitalizeFirstLetter');

const fetchRewards = async () => {
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

      const rewards = data.data;

      for (let i = 0; i < rewards.length; i++) {
        const record = rewards[i];
        allRewards.push(record);
      }

      skip += limit;
      recordsReceived += rewards.length;
    }

    const api = await getToken();
    const { data: resultsData } = await api.post('/custom-fields/query', {
      limit: null,
      skip: 0,
      multiFields: [
        {
          queryFields: ['appliesTo'],
          queryValue: 'Reward'
        }
      ]
    })
    const customFields = await resultsData.results.reduce((acc, obj) => {
      acc[obj['key']] = null
      return acc
    }, {});

    const rewardWithCustomFields = [];

    for (let i = 0; i < allRewards.length; i++) {
      const record = allRewards[i];
      const transformedReward = await transformReward(record, customFields);
      rewardWithCustomFields.push(transformedReward);
    }

    const entityName = 'reward';
    writeFile(entityName, rewardWithCustomFields);

    isFetched = true;
  } catch (e) {
    console.error('Fetch rewards error => ', e);
  }

  if (isFetched) await createRewards();
};

async function transformReward(inputObject, customFields) {
  const metadata = inputObject.metadata.length
    ? inputObject.metadata.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {})
    : null;

  const constraints = [];
  if (inputObject.memberAcknowledgmentRequired === true) {
    constraints.push('memberAcknowledgmentRequired')
  }

  return {
    name: inputObject.rewardName,
    tags: null,
    rewardRank: inputObject.rewardRank.length ? inputObject.rewardRank : '1',
    rewardValue: inputObject.value,
    entityId: inputObject.entityId,
    entityType: capitalizeFirstLetter(inputObject.entityType),
    constraints: constraints,
    rewardTypeId: inputObject.rewardType,
    icon: null,
    description: inputObject.description.length ? inputObject.description : null,
    issueLimit: null,
    delay: inputObject.delay ?? 0,
    pointInTime: null,
    period: inputObject.period ?? 0,
    customFields: customFields,
    metadata: metadata,
    translations: []
  };
}

async function createRewards() {
  const rewardData = require('./mutatedData/reward/rewards.json');

  const api = await getToken();

  for (let i = 0; i < 3; i++) {
    try {
      await api.post('/rewards', [rewardData[i]])
    } catch (e) {
      console.log('create rewards error', e.response.data);
    }
  }
}

fetchRewards()

