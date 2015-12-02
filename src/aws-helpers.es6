import AWS, {EC2} from "aws-sdk";
import _, {pluck, chain, find} from "lodash";
import Promise, {promisifyAll} from "bluebird";

const ec2 = promisifyAll(new EC2({region: 'eu-west-1'}));

export async function listAll() {
  return parseInstancesList(await ec2.describeInstancesAsync({Filters: [{Name: 'instance-state-name', Values: ['running']}]}));
}

export async function listByName(name) {
  const items = await listAll();
  return items.filter((i)=>(i.name.match(name)));
}

export async function usernameForImageId(imageId) {
  const {Images} = await ec2.describeImagesAsync({ImageIds: [imageId]});
  return getSSHUser(Images[0].Name);
}

function getSSHUser(imageName) {
  if (imageName.match(/rancher/i)) {
    return 'rancher';
  } else if (imageName.match(/ecs/i)) {
    return 'ec2-user';
  } else if (imageName.match(/ubuntu/i)) {
    return 'ubuntu';
  } else if (imageName.match(/cent/i)) {
    return 'centos';
  } else if (imageName.match(/amzn/i)) {
    return 'ec2-user';
  } else {
    throw new Error(`dont know user for ami: ${imageName}`)
  }
}

function parseInstancesList(instances) {
  const {Reservations} = instances;
  return chain(Reservations)
    .pluck('Instances')
    .flatten()
    .filter(({PublicDnsName, Tags})=> (find(Tags, {Key: 'Name'}) && PublicDnsName))
    .map(({PublicDnsName, Tags, KeyName, ...other})=>({name: find(Tags, {Key: 'Name'}).Value, dns: PublicDnsName, key: KeyName, ...other}))
    .value();
}
