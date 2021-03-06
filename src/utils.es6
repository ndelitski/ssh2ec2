import inquirer from "inquirer";

export function prompt(...args) {
  return new Promise((resolve)=>{
    inquirer.prompt.apply(inquirer, args.concat(resolve));
  });
}
