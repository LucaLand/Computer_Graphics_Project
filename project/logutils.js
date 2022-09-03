var logEnabled = true;

function enableLog() {
  logEnabled = true;
}

function disableLog() {
  logEnabled = false;
}

function log(str) {
  if(logEnabled) {
    console.log(str);
  }
}

function setLoggerName(name) {
  loggerName = name;
}

function logN(name, str) {
  log(name + " | " + str);
}
