 // Define the structure of the main component and set the page title.
// Create a dropdown to select webcams and an input form for RTSP streaming.
// Display the streaming video and provide controls like start/stop and undo.
// Implement a toggle for switching between AI mode and Normal mode.
// Design the offcanvas for intruder alerts and include a logout button.
//To execute open terminal and cd demo->npm i->npm start and it wiil start the server type localhost:3000 in web browser 
// Import necessary React components and libraries

<h1>how to create react project </h1>

Quick Start

npx create-react-app my-app
cd my-app
npm start



npx
npx create-react-app my-app
(npx comes with npm 5.2+ and higher, see instructions for older npm versions)

npm
npm init react-app my-app
npm init <initializer> is available in npm 6+

Yarn
yarn create react-app my-app
yarn create is available in Yarn 0.25+

Selecting a template
You can now optionally start a new app from a template by appending --template [template-name] to the creation command.

If you don't select a template, we'll create your project with our base template.

Templates are always named in the format cra-template-[template-name], however you only need to provide the [template-name] to the creation command.

npx create-react-app my-app --template [template-name]
You can find a list of available templates by searching for "cra-template-*" on npm.

Our Custom Templates documentation describes how you can build your own template.

Creating a TypeScript app
You can start a new TypeScript app using templates. To use our provided TypeScript template, append --template typescript to the creation command.

npx create-react-app my-app --template typescript
If you already have a project and would like to add TypeScript, see our Adding TypeScript documentation.

Selecting a package manager
When you create a new app, the CLI will use npm or Yarn to install dependencies, depending on which tool you use to run create-react-app. For example:

# Run this to use npm
npx create-react-app my-app
# Or run this to use yarn
yarn create react-app my-app
