# Contribute

If you want to contribute solving a bug, adding a new feature, etc. Please follow this instructions and make sure that an issue (ticket) exists for the contribution that you are about to make (if no
issue exists, please, create a new one).



## Make a fork and branch for your contribution

Fork this repository and create a new branch named like the issue number.
For example, if the issue number is #44, create a new branch called '44' and write your changes there.



## Test your changes before submitting pull request

### Generate a local build

When your changes are ready, please generate a local build to test it running the following commands:

```shell
npm run build
npm run pack
```

This will generate a local build (named like: keycloak-typescript-1.1.7.tgz) in your parent user folder.

### Use the local build in another node.js project to test it

To install the local build in a node.js project, please run the following command in your project's parent directory:

```shell
npm install /path/to/local/build
```

With this, the local build will be successfully instaled and ready to be tested.



## Generate a pull request

Before generating a new pull request for your branch, please execute the following command to format your code properly:

```shell
npm run prettier:format
```

And that's it!, now just wait until the pull request is approved and merged.