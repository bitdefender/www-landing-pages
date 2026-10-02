import { User } from '@repobit/dex-utils';

/**
 * Reuses the geo lookup that head.html starts before any module loads,
 * so it runs in parallel with the esm.sh downloads instead of after them.
 */
class EarlyGeoUser extends User {
  getGeolocation() {
    return window.earlyGeo?.country ?? super.getGeolocation();
  }

  getUserLocale() {
    return window.earlyGeo?.locale ?? super.getUserLocale();
  }
}

const createUser = async () => new EarlyGeoUser();
const user = createUser();
window.user = user;
export default user;
