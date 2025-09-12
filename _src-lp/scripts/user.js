import { User } from '@repobit/dex-utils';

const createUser = async () => new User();
const user = createUser();
window.user = user;
export default user;
