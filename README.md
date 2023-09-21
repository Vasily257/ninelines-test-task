[Russian version](https://github.com/Vasily257/resume/blob/master/README-RU.md)

# Resume
This project is a test task for the "layout designer" position at [Nine Lines](https://ninelines.agency/en/).

## Functionality
The project is a single-page site-resume with responsive layout built using flexbox and grid layout.  
The website has a preloader, a scroll indicator and a «Fade with shift» animation.  

## Features
The site has several features:
1. The sections order in the menu has been changed to match the content on the site.
2. The site content is not the same as in the layout, because personal information is used, but Perfect Pixel is respected whenever possible.
3. In the mobile layout, the "Skills" header has a height of 22px, but the site uses 20px, like other headers.
4. In the desktop layout, the image of the juggler goes beyond the grid column, so it is reduced to the column boundaries.
5. There are no upper and lower waves on the site, as they are distorted on intermediate screen resolutions.
6. `fade` animation has been added for all blocks of the site to make it more dynamic.
7. The preloader is moving considering the image loading speed. That is, it does not depend on the number of images uploaded,
but on the number of bytes uploaded. At the same time, the loading speed of other resources — for example, `vendor.js ` — is not taken into account.
8. The scroll indicator changes not only the percentage value, but also the color of its border.
9. The previous launch of the preloader and animation is tracked using local storage. Alternatively, you can use
the value of `max-age` in the header `Cache-Control` or the status `304`, but provided that this functionality is configured on the server.
10. Dynamic sharing has been added to the site using the `html2canvas` library. A hidden `share` component is used for sharing.
11. The Gulp assembly incorrectly processes svg icons with radial gradients, so such icons are included in the png sprite.
12. The `autoprefixer` plugin issues a warning that the `auto-fit` value for `grid-template-columns` does not work in IE.
But IE is not supported right now, so warnings are ignored. Alternatively, you can use media expressions.
13. The Gulp assembly actively uses jQuery, but the functionality of the site is written mainly in native JS.

## Technology stack
`Pug`, `SCSS`, `JS`, `Gulp`, `Webpack`

## Links
Site: https://v1364358.hosted-by-vdsina.ru/resume/  
Layout/Еechnical specification: https://www.figma.com/file/ct6rzbxMtNxSYp4eTXEWv6/Frontend-test?type=design&node-id=0-1&mode=design&t=i9sNcEw7V0NMRwUE-0

## Usage
To clone a project, you need to open desired directory and use the command:  
**HTTPS**: `git clone https://github.com/Vasily257/resume.git`  
**SSH**: `git clone git@github.com:Vasily257/resume.git`  

To start a project, you need to open the project folder in the terminal and use the command `npm run start`.  
But before that, you need to install Gulp CLI, if you don't have it: `npm install --global gulp-cli`.

## Status
The project is closed, there are no plans for completion.

[Russian version](https://github.com/Vasily257/resume/blob/master/README-RU.md)
