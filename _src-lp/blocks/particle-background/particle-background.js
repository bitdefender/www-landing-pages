/* eslint-disable prefer-const */
/* eslint-disable camelcase */
function isView(viewport) {
    const element = document.querySelectorAll(`[data-${viewport}-detector]`)[0];
    return !!(element && getComputedStyle(element).display !== 'none');
}

let tsParticles;
let loadAll;

async function init(block) {
    if (isView('mobile')) {
        return;
    }

    // eslint-disable-next-line import/no-unresolved
    tsParticles = (await import('https://cdn.jsdelivr.net/npm/@tsparticles/engine@3.1.0/+esm')).tsParticles;
    // eslint-disable-next-line import/no-unresolved
    loadAll = (await import('https://cdn.jsdelivr.net/npm/@tsparticles/all@3.1.0/+esm')).loadAll;

    const particleIdSelector = 'ts-particles';

    const particleDiv = document.createElement('div');
    particleDiv.setAttribute('id', particleIdSelector);

    block.parentElement.classList.add('we-container');
    const particleBackground = block.parentElement.querySelector('.particle-background');
    particleBackground.prepend(particleDiv);

    async function loadParticles(options) {
        await loadAll(tsParticles);

        await tsParticles.load({ id: particleIdSelector, options });
    }

    const configs = {
        particles: {
        number: {
            value: 30,
        },
        color: {
            value: '#ffffff',
        },
        links: {
            enable: true,
            distance: 200,
        },
        shape: {
            type: 'circle',
        },
        opacity: {
            value: 0.6,
        },
        size: {
            value: {
            min: 2,
            max: 4,
            },
        },
        move: {
            enable: true,
            speed: 2,
        },
        },
        background: {
        color: '#016DFF',
        },
        poisson: {
        enable: true,
        },
        fullScreen: { enable: false },
    };

    await loadParticles(configs);
}

export default async function decorate(block) {
    await init(block);

    window.dispatchEvent(new CustomEvent('shadowDomLoaded'), {
        bubbles: true,
        composed: true, // This allows the event to cross the shadow DOM boundary
    });
}