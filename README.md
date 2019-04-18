# AWS Temporary IP Permissions for Security Groups
Quick-n-dirty repo that allows you to temporarily add an IP address to a declared list of security groups.

Shouldn't be dangerous, but just be warned that this won't be an actively developed repository, so any bugs/quirks may not be updated. Feel free to fork for your own use however! Sure beats typing all of this in manually/having to go into the console, IMO.

You can either clone the repo, or you can `npm install -g aws-ip-temp-permissions`, and then use it from the command line.

## Usage

```
$ aws-ip-temp-permissions -g <group-id1,group-id2,...> -p <port1,port2,...> -c <cidr-ip> -u <aws-profile> -P <protocol>  
  Options:
    -g, --groups    ==>  Security group IDs (comma-delimited)
    -c, --cidr      ==>  CIDR IP address
    -u, --profile   ==>  AWS profile
    -p, --ports     ==>  List of ports for the corresponding security group (comma-delmited)
    -P, --protocols ==>  Protocol to use (i.e. tcp)
    -d, --dry-run   ==>  Tests to see if the command would work without actually executing it (Note: it will throw an error as a normal course of action, even on a 'successful' dry run.)`);
```
