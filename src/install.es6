import path from "path";
import fs from "fs";
import {prompt} from './utils';
import {emoji} from "node-emoji";

const CONF_PATH = path.resolve(home(), '.ssh2ec2');

export default async function install() {
  if (process.env.SSH_KEYS_PATH) {
    return {
      keysDir: process.env.SSH_KEYS_PATH
    }
  } else if (fs.existsSync(CONF_PATH)) {
    const json = fs.readFileSync(CONF_PATH, 'utf-8');
    let parsed;

    try {
      parsed = JSON.parse(json);
    } catch(err) {
      throw new Error(`config ${CONF_PATH} has bad format, failed to parse: ${err}`)
    }

    return parsed;
  } else {
    console.log(`Hi, ${process.env.USER}${emoji.heart}! Seems you first time here, configure:`);
    const {keysDir} = await prompt([{
      type: 'input',
      name: 'keysDir',
      message: 'Where your SSH keys stored?(full path):'
    }]);

    if (!fs.existsSync(keysDir)) {
      console.error(`directory ${keysDir} not found`);
      exit(1);
    }

    const conf = {keysDir};
    fs.writeFileSync(CONF_PATH, JSON.stringify(conf, null, 4), 'utf-8');
    return conf;
  }
}

function home() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
