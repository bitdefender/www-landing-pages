// TEST BRANCH ONLY: uses a local build of @repobit/dex-utils with the early geo lookup (dex-core feature/early-geo-lookup).
import { User } from './vendor/dex-utils-early/index.js';

const createUser = async () => new User();
const user = createUser();
window.user = user;
export default user;
