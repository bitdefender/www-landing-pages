# Your Project's Title...
Your project's description...

## Environments
- Preview: https://main--{repo}--{owner}.hlx.page/
- Live: https://main--{repo}--{owner}.hlx.live/

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Bootstrap

This template uses bootstrap. 5.x version in combination with `purgecss`. `styles/vendor/bootstrap.min.css` only
imports the css classes that being used the project. In order to update the file, use: `npm run purge-css`

## Sass


```sh
npm run up
```
The above command will run node `sass-compile.js` in parallel with `hlx up` which will start your local Helix Pages development environment.

## Local development

1. Create a new repository based on the `helix-project-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [helix-bot](https://github.com/apps/helix-bot) to the repository
1. Install the [Helix CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/helix-cli`
1. Start Franklin Proxy: `hlx up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favorite IDE and start coding :)

## Testing e2e

If you want to run Ghost Inspector tests from the local machine just create a **.env** file on the root of the project, add the GI_KEY value manually and finally, you can run
```sh
npm run test:e2e
```