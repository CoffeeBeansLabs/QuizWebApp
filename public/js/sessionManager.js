class SessionManager {
  constructor() {
    this.session = {};
  }
  createSession (userName) {
    let sessionid = new Date().getTime();
    this.session[sessionid] = userName;
    return sessionid;
  }
  getUserName (sessionid) {
    return this.session[sessionid];
  }
  deleteSession(sessionid) {
    delete this.session[sessionid];
  }
}

module.exports = SessionManager;
