const writeFile = require('./utils/writeFile')

const { axiosGetDataInstance, getToken } = require('./axiosInstance');

const fetchMembers = async () => {
  try {
    const allMembers = [];
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
        const transformedMember = transformMember(record);
        allMembers.push(transformedMember);
      }

      skip += limit;
      recordsReceived += members.length;
    }

    const entityName = 'member';
    writeFile(entityName, allMembers)

    const isDataSaved = true;

    if (isDataSaved) {
      await createMembers()
    }

  } catch (e) {
    console.error('Fetch members error => ', e.response);
  }
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
  const memberData = require('./mutatedData/member/members.json');

  const api = await getToken();

  for (let i = 0; i < memberData.length; i++) {
    try {
      await api.post('/members', [memberData[i]])
    } catch (e) {
      console.log('create members error', e);
    }
  }
}

function parseJwt (token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

fetchMembers();