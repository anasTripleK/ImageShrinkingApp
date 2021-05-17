// console.log('Hello World');
// Packaging Electron.js = > https://www.christianengvall.se/electron-packager-tutorial/
// npm run package-(mac/win/linux) => See package.json, it depends on OS
const path = require('path')
const os = require('os')
const {app, BrowserWindow, Menu, ipcMain, shell/*, globalShortcut*/} = require('electron'); // Node Js module syntax
// Here curly braces specifies that after requiring, what we need
// to fetch out of electron by de-structuring
// 'app' actually manages entire life cycle of our app
// 'BrowserWindow' is a class that is used to create a Desktop Window
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const slash = require('slash')
//https://www.npmjs.com/package/electron-log
// In Windows Log appears at => %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log
const log = require('electron-log')
// Set Environment
process.env.NODE_ENV = 'production'; // Currently, Electron in "Development" phase
const isDev = process.env.NODE_ENV !== 'production' ? true : false; // if(process.env.NODE_ENV !== 'production'){isDev=true;}else{isDev=false;}
const isMac = process.platform === 'darwin' ? true : false;
// Windows Used Below
let mainWindow;
let aboutWindow;
// Main Window Below
function createMainWindow(){
    mainWindow = new BrowserWindow({
        webPreferences: {
            webSecurity: false,
             nodeIntegration:true
          },
        title:'Image Shrink',
        width: isDev ? 800 : 500,
        height:600,
        icon: `${__dirname}/assets/icons/icons/Icon_256x256.png`,
        resizable: isDev,
        backgroundColor:'white',
        webPreferences:{
            nodeIntegration:true,
        },
    })
    // if(isDev){
    //     mainWindow.webContents.openDevTools()
    // }
    mainWindow.loadURL(`file://${__dirname}/app/index.html`)
    // KEEP IN MIND SYNTAX IS(back tick) ` `, not ' ' (not Commas)
}
// About Window Below
function createAboutWindow(){
    aboutWindow = new BrowserWindow({
        webPreferences: {
            webSecurity: false,
             nodeIntegration:true
          },
        title:'Image Shrink',
        width:500,
        height:600,
        icon: `${__dirname}/assets/icons/icons/Icon_256x256.png`,
        resizable: isDev,
        backgroundColor:'black'
    })
    aboutWindow.loadURL(`file://${__dirname}/app/about.html`)
    // KEEP IN MIND SYNTAX IS(back tick) ` `, not ' ' (not Commas)
}
//app.on('ready',createMainWindow);
//app.whenReady().then(createMainWindow) ARE SAME AS //app.on('ready',createMainWindow);
// 
app.on('ready',()=>{
    createMainWindow()

    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)
    // globalShortcut.register('CmdOrCtrl+R', ()=>mainWindow.reload())
    // globalShortcut.register(isMac ? 'Ctrl+Alt+I':'Ctrl+Shift+I',()=>mainWindow.toggleDevTools())
    mainWindow.on('closed',() => (mainWindow=null))
});

const menu =[
    {
        role:'fileMenu',
        // label:'File',
        // submenu: [
        //     {
        //         // Quit Option Added
        //         label: 'Quit',
        //         accelerator: 'CmdOrCtrl+W',
        //         click: ()=> app.quit() 
        //         // Quit Option Above
        //     }
        // ]
    },
    ...(isDev ?
        [
            {
                label:'Developer',
                submenu:[
                    {role:'reload'},
                    {role:'forcereload'},
                    {type:'separator'},
                    {role:'toggleDevTools'},
                ],
            },
        ]
        :
        [
            // No Change
        ]
        ), // isDev End
    // ...(isDev ? [
    //     {
    //         label:'Developer',
    //         submenu:[
    //             {role:'reload'},
    //             {role:'forcereload'},
    //             {type:'separator'},
    //             {role:'toggledevtools'},
    //         ]
    //     }
    // ]:[])
    ...(isMac
        ? [
            {
                label:app.name,
                submenu:[
                    {
                        label:'About',
                        click: createAboutWindow
                    },
                ],
            }
        ]
        :
        [
            {
                label:'Help',
                submenu:[
                    {
                        label:'About',
                        click: createAboutWindow
                    },
                ], 
            }
        ]
    ),
]

ipcMain.on('image:minimize', (e,options)=> {
    options.dest = path.join(os.homedir(), '/Desktop/ImageShrinkTestFolder')
    shrinkImage(options)
})
async function shrinkImage({imgPath, quality, dest}){
    try{
        const pngQuality = quality / 100
        const files = await imagemin([slash(imgPath)],{
            destination: dest,
            plugins: [
                imageminMozjpeg({quality}),
                imageminPngquant({
                    quality:[pngQuality, pngQuality]
                }),
            ],
        })
        //console.log(files)
        log.info(files)
        shell.openPath(dest)
        mainWindow.webContents.send('image:done')
        // It can be ipcMain.send or ipcMain.reply
    }
    catch(err){
        //console.log(err)
        log.error(err)
    }
}
// Mac Configurations
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
})
//

app.allowRendererProcessReuse=true;

// GET STARTED W/ELECTRION BELOW
// // const { app, BrowserWindow } = require('electron')

// // function createWindow () {
// //   const win = new BrowserWindow({
// //     width: 800,
// //     height: 600,
// //     webPreferences: {
// //       nodeIntegration: true
// //     }
// //   })

// //   win.loadFile('index.html')
// //   win.webContents.openDevTools()
// // }

// // app.whenReady().then(createWindow)

// // app.on('window-all-closed', () => {
// //   if (process.platform !== 'darwin') {
// //     app.quit()
// //   }
// // })

// // app.on('activate', () => {
// //   if (BrowserWindow.getAllWindows().length === 0) {
// //     createWindow()
// //   }
// // })