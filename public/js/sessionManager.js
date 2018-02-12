class SessionManager {
  constructor() {
    this.session = {};
  }
  createSession (userName, password) {
    let sessionid = new Date().getTime();
    this.session[sessionid] = userName+'&'+password;
    return sessionid;
  }
  getUserNameAndPassword (sessionid) {
    return this.session[sessionid];
  }
  deleteSession(sessionid) {
    delete this.session[sessionid];
  }
}

module.exports = SessionManager;
