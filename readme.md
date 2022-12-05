# p5 template project

## Installing

- Install Node ([https://nodejs.org/](https://nodejs.org/)). Choose the LTS version (or the Current, it doesn't matter).
- Install a good IDE if you don't have one already. I do highly recommend VS Code ([https://code.visualstudio.com/](https://code.visualstudio.com/)).
- Download this repository (Use the green "Code" button at the top of the page -> "Download ZIP")
- Extract the ZIP you just downloaded
- Open the extracted folder in your IDE (like VS Code)
- Open a terminal at the root of the folder (you can do it in VS Code by simply dragging up the bottom of the window) and type the following command :

For Windows :
```
npm i -g npm-run-all typescript browser-sync
```

For Linux and Mac :
```
sudo npm i -g npm-run-all typescript browser-sync
```

Only use this command the first time you ever use this template (-g means you install things globally)

### Launching

Whenever you want to work on your project, simply launch it with

```
npm start
```

A local version will now be running at [localhost:3000](http://localhost:3000)  
You can now write all the p5 things you want in __*src/sketch.ts*__

### Publishing online

#### Using GitHub Pages

Create a GitHub repository and commit all your files (if that's not already done)

Then in the **Settings** of your repository, under **GitHub Pages** set Source to *main* and click Save.  
If you scroll back down to **GitHub Pages** you can now see the url of your sketch ! (it might take a few minutes to be published online)
