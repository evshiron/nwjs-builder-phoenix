This only has an extra field named **build** and also added 2 more fields (`dist` and `start`) to **scripts** in the previous [package.json](./package-json-v1.md)

```javascript
  {
    "name": "generator",
    "version": "1.0.0",
    "description": "An NW based desktop application",
    "main": "src/views/index.html",
    "scripts": {
      "test": "node ./test/test_any.js",
      "dist": "build --tasks win-x64 --mirror https://dl.nwjs.io/ .",
      "start": "run --x86 --mirror https://dl.nwjs.io/ ."
    },
    "build": {
      "nwVersion": "0.35.1"
    },
    "window": {
      "icon": "./src/assets/svg/hydro-power.svg",
      "width": 1300,
      "height": 800
    },
    "repository": {
      "type": "git",
      "url": "https://gitlab.com/generator-team/nwjs/genw-dev.git"
    },
    "keywords": [
      "Node.js",
      "NW.js",
      "JavaScript",
      "jQuery",
      "CSS",
      "Bootstrap3",
      "Video",
      "PPT",
      "JSON",
      "CSV",
      "HTML",
      "HTML5",
      "LaTeX",
      "BibTeX",
      "MikTeX",
      "TexWorks",
      "TexLive",
      "MacTeX",
      "Pdf",
      "Social media",
      "Linkedin",
      "Twitter",
      "Facebook",
      "YouTube",
      "Desktop application (Cross platform)"
    ],
    "author": "Rishikesh Agrawani",
    "license": "MIT"
  }
```