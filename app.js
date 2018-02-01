const { Client } = require('discord-rpc'),
      spotifyWeb = require('./spotify'),
      /*log = require("fancy-log"),*/
      events = require('events'),
      fs = require('fs'),
      r = require('request'),
      keys = require('./keys.json');
const electron = require('electron');
const {Menu, Tray} = require('electron');
const BrowserWindow = electron.BrowserWindow;
const app = electron.app;
const path = require('path');
var log = require('electron-log');
config = require('./config.json');

log.transports.file.appName = 'SpotifyRPC';
log.transports.file.level = 'info';
log.transports.file.format = '{h}:{i}:{s}:{ms} {text}';
log.transports.file.maxSize = 5 * 1024 * 1024;
log.transports.file.file = __dirname + '/log.txt';
log.transports.file.streamConfig = { flags: 'w' };
log.transports.file.stream = fs.createWriteStream('log.txt');

//------------------ CUSTOM ARTISTS ------------------\\
//Custom artist pictures
const imageKey = "spotify";
const imageText = "Spotify Premium";
const imageKeyAG = "arianagrande";
const imageTextAG = "Ariana Grande";
const imageKeyDL = "dualipa";
const imageTextDL = "Dua Lipa";
const imageKeyMM = "marshmello";
const imageTextMM = "Marshmello";
const imageKeyWK = "wildcard";
const imageTextWK = "Wildcard - KSHMR";
const imageKeyB = "bausa";
const imageTextB = "Was Du Liebe nennst - Bausa";
const imageKeygld = "gld";
const imageTextgld = "Girls Love DJs";
const imageKeyFR = "florida";
const imageTextFR = "Flo Rida";
const imageKeyID = "id";
const imageTextID = "Imagine Dragons";
const imageKeyKP = "katyperry";
const imageTextKP = "Katy Perry";
const imageKeyRS = "robinschulz";
const imageTextRS = "Robin Schulz";
const imageKeyBR = "beberexha";
const imageTextBR = "Bebe Rexha";
const imageKeyHS = "hs";
const imageTextHS = "Hailee Steinfeld";
const imageKeyS = "slushii";
const imageTextS = "Slushii";
const imageKeyQ = "queen";
const imageTextQ = "Queen";
const imageKeyTS = "taylorswift";
const imageTextTS = "Taylor Swift";
const imageKeySG = "selenagomez";
const imageTextSG = "Selena Gomez";
const imageKeyA = "avicii";
const imageTextA = "Avicii";
const imageKeyD = "disclosure";
const imageTextD = "Disclosure";
const imageKeyGE = "geasy";
const imageTextGE = "G-Eazy";
const imageKeyN = "neffex";
const imageTextN = "Neffex";
const imageKeyTN = "xxxtentacion";
const imageTextTN = "XXXTENTACION";
//-------------------END CUSTOM ARTISTS----------------\\

const rpc = new Client({ transport: keys.rpcTransportType }),
      s = new spotifyWeb.SpotifyWebHelper(),
      appClient = "386180473702973461",
      largeImageKey = keys.imageKeys.large,
      smallImageKey = keys.imageKeys.small,
      smallImagePausedKey = keys.imageKeys.smallPaused;

var songEmitter = new events.EventEmitter(),
    currentSong = {};

async function spotifyReconnect () {
  s.getStatus(function(err, res) {
    if (!err) {
      clearInterval(check);
      global.intloop = setInterval(checkSpotify, 1500);
    }
  });
}

async function checkSpotify() {
  s.getStatus(function (err, res) {
    if (err) {
      if (err.code === "ECONNREFUSED") {
        if (err.address === "127.0.0.1" && err.port === 4381) {
            /**
             * Temporary workaround - to truly fix this, we need to change spotify.js to check for ports above 4381 to the maximum range.
             * This is usually caused by closing Spotify and reopening before the port stops listening. Waiting about 10 seconds should be
             * sufficient time to reopen the application.
             **/
            log.error("Spotify seems to be closed or unreachable on port 4381! Close Spotify and wait 10 seconds before restarting for this to work. Checking every 5 seconds to check if you've done so.");
            clearInterval(intloop);
            global.check = setInterval(spotifyReconnect, 5000);
	      }
      } else {
          log.error("Failed to fetch Spotify data:", err);
      }
      return;
    }

    if (!res.track.track_resource || !res.track.artist_resource) return;

    if (currentSong.uri && res.track.track_resource.uri == currentSong.uri && (res.playing != currentSong.playing)) {
      currentSong.playing = res.playing;
      currentSong.position = res.playing_position;
      songEmitter.emit('songUpdate', currentSong);
      return;
    }

    if (res.track.track_resource.uri == currentSong.uri) return;

    let start = parseInt(new Date().getTime().toString().substr(0, 10)),
        end = start + (res.track.length - res.playing_position);

    var song = {
      uri: (res.track.track_resource.uri ? res.track.track_resource.uri : ""),
      name: res.track.track_resource.name,
      album: (res.track.album_resource ? res.track.album_resource.name : ""),
      artist: (res.track.artist_resource ? res.track.artist_resource.name : ""),
      playing: res.playing,
      position: res.playing_position,
      length: res.track.length,
      start,
      end
    };

    currentSong = song;

    songEmitter.emit('newSong', song);
  });
}

const updateSpoticordOuterscope = (song) => {
  r.post({
    uri: "https://api.nations.io/v1/outerscope/spotifyAnalytics",
    headers: {'Content-Type': 'application/json', 'User-Agent': 'spoticord-rev2'},
    json: {uri: song.uri, name: song.name, artist: song.artist}
  });
};

/**
 * Initialise song listeners
 * newSong: gets emitted when the song changes to update the RP
 * songUpdate: currently gets executed when the song gets paused/resumes playing.
 **/
songEmitter.on('newSong', song => {
  if (song.artist == "Taylor Swift"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyTS,
      smallImageKey,
      largeImageText: imageTextTS,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Ariana Grande"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyAG,
      smallImageKey,
      largeImageText: imageTextAG,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Dua Lipa"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyDL,
      smallImageKey,
      largeImageText: imageTextDL,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Marshmello"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyMM,
      smallImageKey,
      largeImageText: imageTextMM,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "gld"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeygld,
      smallImageKey,
      largeImageText: imageTextgld,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Hailee Steinfeld"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyHS,
      smallImageKey,
      largeImageText: imageTextHS,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Flo Rida"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyFR,
      smallImageKey,
      largeImageText: imageTextFR,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Imagine Dragons"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyID,
      smallImageKey,
      largeImageText: imageTextID,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Katy Perry"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyKP,
      smallImageKey,
      largeImageText: imageTextKP,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Robin Schulz"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyRS,
      smallImageKey,
      largeImageText: imageTextRS,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Bebe Rexha"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyBR,
      smallImageKey,
      largeImageText: imageTextBR,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Slushii"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyS,
      smallImageKey,
      largeImageText: imageTextS,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Queen"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyQ,
      smallImageKey,
      largeImageText: imageTextQ,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Selena Gomez"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeySG,
      smallImageKey,
      largeImageText: imageTextSG,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Avicii"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyA,
      smallImageKey,
      largeImageText: imageTextA,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Disclosure"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyD,
      smallImageKey,
      largeImageText: imageTextD,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "G-Eazy"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyGE,
      smallImageKey,
      largeImageText: imageTextGE,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "Neffex"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyN,
      smallImageKey,
      largeImageText: imageTextN,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else if (song.artist == "XXXTENTACION"){
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey: imageKeyTN,
      smallImageKey,
      largeImageText: imageTextTN,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  } else {
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp: song.start,
      endTimestamp: song.end,
      largeImageKey,
      smallImageKey: "play_button_clean",
      largeImageText: `Spotify Premium`,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  }
  if(keys.shareAnonAnalytics) updateSpoticordOuterscope(song);

  log.info(`Updated song to: ${song.artist} - ${song.name}`);
});

songEmitter.on('songUpdate', song => {
  let startTimestamp = song.playing ?
    parseInt(new Date().getTime().toString().substr(0, 10)) - song.position :
    undefined,
    endTimestamp = song.playing ?
    startTimestamp + song.length :
    undefined;
    rpc.setActivity({
      details: `🎵  ${song.name}`,
      state: `👤  ${song.artist}`,
      startTimestamp,
      endTimestamp,
      largeImageKey,
      smallImageKey: startTimestamp ? "play_button_clean" : smallImagePausedKey,
      largeImageText: `Spotify Premium`,
      smallImageText: `💿  ${song.album}`,
      instance: false,
    });
  log.info(`Song state updated (playing: ${song.playing})`)
});

rpc.on('ready', () => {
    log.info(`Connected to Discord! (${appClient})`);
    global.intloop = setInterval(checkSpotify, 1500);
});

//when the program is succesfully started
app.on('ready', function () {
  log.info("SpotifyRPC is starting...");
  //show splash/loading screen
  let win = new BrowserWindow({width: 1000, height: 600, frame: false});
  win.loadURL(path.join('file://', __dirname, '/main.html'));
  //makes tray icon for closing and managing the program
  tray = new Tray(path.join(__dirname, '/img/spotify.ico'));
  const contextMenu = Menu.buildFromTemplate([
      {label: 'Settings'},
      {label: 'Close'},
  ]);
  tray.setToolTip('Spotify RPC (click to close)');
  //tray.setContextMenu(contextMenu);
  /*tray.on('ContextMenu-show', () => {
    log.info("Clicked context menu");
  });*/
  tray.on('click', () => {
    log.info("Closing SpotifyRPC");
    let thxwin = new BrowserWindow({width: 1000, height: 600, frame: false});
    thxwin.loadURL(path.join('file://', __dirname, '/thx.html'));
    tray.destroy();
    setTimeout(function() {
      app.exit();
    }, 5000);
  });
  setTimeout(function() {
    win.hide();
    //login to RPC
    rpc.login(appClient).catch(log.error);
  }, 6000);
});

