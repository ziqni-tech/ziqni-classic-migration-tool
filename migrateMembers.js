const { axiosGetDataInstance, getToken } = require('./axiosInstance');
const writeFile = require('./utils/writeFile');

const entityName = 'member';

const downloadedFileName = 'downloadedFromOldPlatform';
const transformedFileName = 'transformed';
const createdFileName = 'createdOnNewPlatform';

const fetchMembers = async () => {
  let isFetched = false;

  try {
    const allMembers = [];
    const transformedMembers = [];
    let totalRecordsFound = 5;
    const limit = 100;
    let skip = 0;
    let recordsReceived = 0;

    while (recordsReceived < totalRecordsFound) {
      const { data } = await axiosGetDataInstance.get(`/members?_limit=${limit}&_skip=${skip}`);

      totalRecordsFound = data.meta.totalRecordsFound;

      const members = data.data;

      for (let i = 0; i < members.length; i++) {
        const record = members[i];
        allMembers.push(record);

        const transformedMember = transformMember(record);
        transformedMembers.push(transformedMember);
      }

      skip += limit;
      recordsReceived += members.length;
    }

    writeFile(entityName, downloadedFileName, allMembers);
    writeFile(entityName, transformedFileName, transformedMembers);

    isFetched = true;
  } catch (e) {
    console.error('Fetch members error => ', e.response);
  }

  if (isFetched) await createMembers();
};

function transformMember(inputObject) {
  return {
    name: inputObject.name,
    memberRefId: inputObject.memberRefId,
    memberType: inputObject.memberType,
    addConstraints: null,
    timeZoneOffset: null,
    customFields: null,
    metadata: null,
    tags: null,
  };
}

async function createMembers() {
  const memberData = require(`./entitiesData/${entityName}/transformed.json`);

  const api = await getToken();
  const createdMembers = [];

  for (let i = 0; i < memberData.length; i++) {
    try {
      const { data } = await api.post('/members', [memberData[i]]);

      if (data.errors) {
        data.errors.forEach(item => {
          console.log('Create member Error => ', item.detail);
        });
      }

      if (data.results.length) {
        createdMembers.push(data.results[0]);
      }
    } catch (e) {
      console.log('create members error', e);
    }
  }

  writeFile(entityName, createdFileName, createdMembers);
}

fetchMembers();