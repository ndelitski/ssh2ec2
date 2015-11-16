import path from 'path';
import {pluck, sortBy} from "lodash";
import {listAll, listByName, usernameForImageId} from "./aws-helpers";
import inquirer from "inquirer";
import Promise, {promisify} from 'bluebird';
import moment from "moment";
import {emoji} from "node-emoji";
import {existsSync} from "fs";
import {spawn} from "child_process";
import install from "./install";
import {prompt} from './utils';

const exit = process.exit;
const {warn, log, error} = console;

(async function() {
  const {keysDir} = await install();

  const name = process.argv[2];
  if (!name) {
      warn('type instance name');
  }

  const instances = sortBy(await listByName(name), 'name');

  if (!instances.length) {
    log(`no instances found with name '${name}'`)
    exit(0);
  }

  const {item} = await prompt([{
    type: "list",
    name: "item",
    message: "Select instance connect to?",
    choices: instances.map(formatItem)
  }]);

  const index = item.match(/^\d+/)[0];
  const selected = instances[index];
  const user = await usernameForImageId(selected.ImageId);

  ssh({dns: selected.dns, key: path.join(keysDir, `${selected.key}.pem`), user });
})();

process.on('uncaughtException', (err) => {
  error(err);
  error(err.stack);
  exit(1);
})

function ssh({dns, key, user}) {

  if (!existsSync(key)) {
    warn(`${key} not found`);
    exit(1);
  }

  // write to stderr for wrapper bash script
  const cmd = `ssh -i ${key} ${user}@${dns} -o StrictHostKeyChecking=no`;
  //fs.createWriteStream(null, { fd: 3 }).end();
  error(cmd);

  return;
  const ssh = spawn('ssh', [
    '-tt',
    '-l',
    'ec2-user',
    '-i',
    keyPath,
    dns,
    '-o',
    'StrictHostKeyChecking=no'
  ]);

  process.stdin.pipe(ssh.stdin);
  process.stdin.resume();

  ssh.stdout.pipe(process.stdout);
  ssh.stderr.pipe(process.stderr);

  process.on('SIGINT', function () {
    console.log('MAIN');
  });

  ssh.on('SIGINT', function () {
    console.log('child');
  });

  ssh.on('exit', function (code) {
    log('ssh process exit with code ' + code);
    exit(0);
  });
}


function formatItem({name, LaunchTime, InstanceId}, i) {
  const time = moment(LaunchTime).fromNow();
  return `${i} ${name} ${emoji.alarm_clock}${time} [${InstanceId}]`
}
