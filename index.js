#!/usr/bin/env node

const program = require('commander');
const { exec } = require('child_process');
const readlineSync = require('readline-sync');

// Small Note: This code was built for personal, small-scale use. If you somehow stumbled upon this, just note that there is a bit o' spaghetti/unclean code here that just happens to work when used correctly.

const displayHelp = () => {
  console.log(`AWS Utility for temporarily adding your current IP address to declared security groups.
  Options:
    -g, --groups    ==>  Security group IDs (comma-delimited)
    -c, --cidr      ==>  CIDR IP address
    -u, --profile   ==>  AWS profile
    -p, --ports     ==>  List of ports for the corresponding security group (comma-delmited)
    -P, --protocols ==>  Protocol to use (i.e. tcp)
    -d, --dry-run   ==>  Tests to see if the command would work without actually executing it (Note: it will throw an error as a normal course of action, even on a 'successful' dry run.)`);
};

const doit = async opts => {
  if (program.rawArgs.length <= 2) {
    console.log('Error: No arguments specified.');
    return displayHelp();
  } else if (program.rawArgs[2].split('')[0] !== '-') {
    console.log('Error: Invalid argument.');
    return displayHelp();
  }

  let { profile, protocol, groups, ports, cidr, dryRun } = opts;

  if (profile == "undefined") {
    profile = "default";
  }

  if (groups.length !== ports.length) {
    console.log(`Number of ports must match number of groups.`);
    console.log(`Number of groups given: ${groups.length}`);
    console.log(`Number of ports given: ${ports.length}`);

    return 1;
  }

  console.log(`Adding IP to groups ${groups}`);

  for (let i = 0; i < groups.length; i++) {
    const authorize = `aws ec2 --profile ${profile} authorize-security-group-ingress --group-id ${groups[i]} --protocol ${protocol ? protocol : 'tcp'} --port ${ports[i]} --cidr ${cidr} ${dryRun ? '--dry-run' : ''}`;

    const revoke = `aws ec2 --profile ${profile} revoke-security-group-ingress --group-id ${groups[i]} --protocol ${protocol ? protocol : 'tcp'} --port ${ports[i]} --cidr ${cidr} ${dryRun ? '--dry-run' : ''}`;

    try {
      console.log(`Trying to authorize ${groups[i]}...`);
      await execit(authorize);
      console.log(`Successfully authorized: ${groups[i]}...`);
    } catch (err) {
      try {
        console.log(`IP already exists. Attempting to revoke... ${groups[i]}`);
        await execit(revoke);
        console.log('Revoke successful.');
        --i;
      } catch (err) {
        console.log('Revoking failed...');
        console.log(err);
        return 1;
      }
    }
  };

  console.log('IP successfully added!');

  readlineSync.question('Press any key to revoke access...');

  console.log('Attempting to revoke authorized IP...');

  for (let i = 0; i < groups.length; i++) {
    const revoke = `aws ec2 --profile ${profile} revoke-security-group-ingress --group-id ${groups[i]} --protocol ${protocol ? protocol : 'tcp'} --port ${ports[i]} --cidr ${cidr} ${dryRun ? '--dry-run' : ''}`;
    try {
      await execit(revoke);
      console.log('Revoke successful!');
    } catch (err) {
      console.log('Failure while attempting to revoke IP permissions.');
      console.log(err);
    }
  };

  console.log('Exiting...');

  return 0;
};

const execit = fn => {
  return new Promise((res, rej) => {
    exec(fn, (err, stdout, stderr) => {
      if (err) {
        rej(false);
      } else {
        res(true);
      }
    });
  });
};

const list = vals => {
  return vals.split(',');
};

program
  .option('-g, --groups <group>', 'Security Group ID', list)
  .option('-c, --cidr <cidr>', 'CIDR IP')
  .option('-u, --profile <profile>', 'Profile')
  .option('-P, --protocols <protocol>', 'Protocol')
  .option('-d, --dry-run', 'Dry run')
  .option('-p, --ports <port>', 'TCP Ports', list)
  .action(doit)
  .parse(process.argv);

program.on('command:*', displayHelp);

