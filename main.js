/**
 * @author Luis Miguel Naranjo Pastrana <luismiguelnaranjop@gmail.com>
 * @member App Controla el ciclo de vida de los eventos de su aplicación.
 * @member BrowserWindow Crea y controla las ventanas del navegador.
 * @member Menu Crea menús de aplicaciones nativas y menús contextuales.
 */
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path')

/**
 * Se mantiene una referencia global del objeto window, si no lo haces, la ventana se cerrará 
 * automáticamente cuando el objeto JavaScript sea eliminado por el recolector de basura.
 */
let mainWindow;
let newProductWindow;

/**
 * Esta es (con suerte) la forma más sencilla de cargar contenido de todos los BrowserWindows 
 * activos dentro de electron cuando se cambian los archivos fuente.
 */
// Reload in Development for Browser Windows
if (process.env.NODE_ENV !== 'production') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    });
}

/**
 * @event ready Emitido cuando Electron se ha terminado de iniciar.
 */
app.on('ready', () => {
    createMainWindow();
});


/**
 * Metodo que crea la ventana principal de la aplicación
 */
function createMainWindow() {

    // Crea una nueva BrowserWindow con propiedades nativas
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });

    // El url puede ser una dirección remota (por ejemplo http://) o una de un archivo local HTML 
    // utilizando el protocolo file://. Para garantizar que los URLs del archivo estén adecuadamente 
    // formateados, se utilizó el método url.format 
    let url = require('url').format({
        protocol: 'file',
        slashes: true,
        pathname: require('path').join(__dirname, '/src/index.html')
    })

    // Se carga el URL con la ruta del archivo index.html 
    mainWindow.loadURL(url);

    // Al cerrar la ventana principal se debe terminar la aplicación
    mainWindow.on('close', () => {
        app.quit();
    })

    // template es un arreglo de options para construir un MenuItem. 
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

/**
 * Metodo que crea una nueva ventana para agregar un nuevo producto
 */
function createNewProductWindow() {

    newProductWindow = new BrowserWindow({
        width: 400,
        height: 350,
        title: 'Agregar nuevo producto',
        webPreferences: {
            nodeIntegration: true
        }
    });

    // newProductWindow.setMenu(null);

    let url = require('url').format({
        protocol: 'file',
        slashes: true,
        pathname: require('path').join(__dirname, '/src/new-product.html')
    })

    newProductWindow.loadURL(url);

    // El escuchar el evento 'close' se debe limpiar la variable que almacenaba la ventana 
    newProductWindow.on('close', () => {
        newProductWindow = null;
    });
}

ipcMain.on('product:new', (e, newProduct) => {
    // send to the Main Window
    console.log(newProduct);
    mainWindow.webContents.send('product:new', newProduct);
    newProductWindow.close();
});

// Menu Template
const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New Product',
                accelerator: 'Ctrl+N',
                click() {
                    createNewProductWindow();
                }
            },
            {
                label: 'Remove All Products',
                click() {
                    mainWindow.webContents.send('products:remove-all');
                }
            },
            {
                label: 'Exit',
                accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// Developer Tools in Development Environment
if (process.env.NODE_ENV !== 'production') {
    template.push({
        label: 'DevTools',
        submenu: [
            {
                label: 'Show/Hide Dev Tools',
                accelerator: process.platform == 'darwin' ? 'Comand+D' : 'Ctrl+D',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}