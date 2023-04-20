const { axiosGetDataInstance, getToken } = require('./axiosInstance');
const writeFile = require('./utils/writeFile');

const entityName = 'member';

const downloadedFileName = 'downloaded';
const transformedFileName = 'transformed';
const createdFileName = 'created';

const fetch = async () => {
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
        allMembers.push(record);
      }

      skip += limit;
      recordsReceived += members.length;
    }

    writeFile(entityName, downloadedFileName, allMembers);
  } catch (e) {
    console.error('Fetch members error => ', e.response);
  }
};

const transform = async () => {
  const allMembers = require(`./entitiesData/${entityName}/downloaded.json`);

  const transformedMembers = [];
  for (let i = 0; i < allMembers.length; i++) {
    const record = allMembers[i];
    const transformedMember = transformMember(record);
    transformedMembers.push(transformedMember);
  }

  writeFile(entityName, transformedFileName, transformedMembers);
}

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

async function create() {
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