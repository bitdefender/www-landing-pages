import { waitFor } from '@testing-library/dom';
import decorate from '../header.js';
import userPromise from '../../../scripts/user.js';

const CENTRAL_LOGIN_URL = 'https://login.bitdefender.com/central/login.html?lang=en_US&redirect_url=https:%2F%2Fcentral.bitdefender.com';

// the blue-logo nav from /pages/consumer/en/new/lp-brand-4pr-individual-dlp-2/nav
const blueLogoNav = `
  <div>
    <p><picture><img src="./media_logo.png" alt="" width="300" height="43"></picture></p>
    <p><a href="${CENTRAL_LOGIN_URL}">Bitdefender Central Login</a></p>
    <div class="section-metadata">
      <div><div>style</div><div>blue-logo</div></div>
    </div>
  </div>`;

describe('header block', () => {
  let user;
  let block;

  const setLoginEnabled = () => {
    const meta = document.createElement('meta');
    meta.name = 'login-enabled';
    meta.content = 'true';
    document.head.append(meta);
  };

  const getCentralLink = () => block.querySelector('a[href*="login.bitdefender.com/central"]');

  beforeEach(async () => {
    user = await userPromise;
    vi.spyOn(user, 'login').mockResolvedValue();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(blueLogoNav));

    document.head.querySelector('meta[name="login-enabled"]')?.remove();
    document.body.innerHTML = '<header><div class="header block"></div></header>';
    block = document.querySelector('.header.block');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('replaces the Central link with the initials of the signed-in user', async () => {
    setLoginEnabled();
    vi.spyOn(user, 'info', 'get').mockResolvedValue({ firstname: 'ana maria', email: 'ana@example.com' });

    await decorate(block);

    await waitFor(() => expect(getCentralLink().classList.contains('user-avatar')).toBe(true));
    const avatar = getCentralLink();
    expect(user.login).toHaveBeenCalled();
    expect(avatar.textContent).toBe('AM');
    expect(avatar.title).toBe('ana maria');
    expect(avatar.getAttribute('aria-label')).toBe('Bitdefender Central Login');
    expect(block.querySelector('.main-logo a').classList.contains('user-avatar')).toBe(false);
  });

  it('takes the initials from the email when there is no first name', async () => {
    setLoginEnabled();
    vi.spyOn(user, 'info', 'get').mockResolvedValue({ firstname: '', email: 'j.doe42@example.com' });

    await decorate(block);

    await waitFor(() => expect(getCentralLink().textContent).toBe('JD'));
    expect(getCentralLink().title).toBe('j.doe42@example.com');
  });

  it('keeps the Central link when nobody is signed in', async () => {
    setLoginEnabled();
    vi.spyOn(user, 'info', 'get').mockResolvedValue(null);

    await decorate(block);
    await new Promise((resolve) => { setTimeout(resolve); });

    expect(getCentralLink().textContent).toBe('Bitdefender Central Login');
    expect(getCentralLink().classList.contains('user-avatar')).toBe(false);
  });

  it('does nothing without the login-enabled metadata', async () => {
    vi.spyOn(user, 'info', 'get').mockResolvedValue({ firstname: 'Ana', email: 'ana@example.com' });

    await decorate(block);
    await new Promise((resolve) => { setTimeout(resolve); });

    expect(user.login).not.toHaveBeenCalled();
    expect(getCentralLink().textContent).toBe('Bitdefender Central Login');
  });
});
