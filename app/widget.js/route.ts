import { NextResponse } from "next/server";

const script = String.raw`(() => {
  const scriptTag = document.currentScript;
  if (!scriptTag) return;

  const siteId = scriptTag.getAttribute('data-site-id');
  if (!siteId) return;

  const scriptSrc = scriptTag.getAttribute('src') || '';
  const apiOrigin = scriptSrc.startsWith('http') ? new URL(scriptSrc).origin : window.location.origin;
  const seenKey = (campaignId) => 'optin_seen_' + campaignId;

  const sendEvent = async (payload) => {
    try {
      await fetch(apiOrigin + '/api/widget/event', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      });
    } catch (_) {}
  };

  const createNode = (tag, text, style) => {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (style) Object.assign(el.style, style);
    return el;
  };

  const showCampaign = (campaign) => {
    const rules = campaign.display_rules || {};
    const delay = Number(rules.delaySeconds || 0) * 1000;
    const scrollPercent = Number(rules.scrollPercent || 0);
    const useExitIntent = Boolean(rules.exitIntent);
    const frequencyHours = Number(rules.frequencyHours || 24);

    const previousShownAt = localStorage.getItem(seenKey(campaign.id));
    if (previousShownAt && Date.now() - Number(previousShownAt) < frequencyHours * 3600000) return;

    let shown = false;

    const show = () => {
      if (shown) return;
      shown = true;
      localStorage.setItem(seenKey(campaign.id), String(Date.now()));

      const overlay = createNode('div', '', {
        position: 'fixed',
        inset: '0',
        zIndex: '999999',
        background: 'rgba(0,0,0,.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      });

      const card = createNode('div', '', {
        background: '#fff',
        maxWidth: '420px',
        width: '100%',
        borderRadius: '12px',
        padding: '20px',
        fontFamily: 'system-ui'
      });

      const title = createNode('h3', campaign.headline || 'Join our newsletter', {
        margin: '0 0 6px',
        fontSize: '24px'
      });
      const subtitle = createNode('p', campaign.subheadline || '', {
        margin: '0 0 12px',
        color: '#475569'
      });
      const form = createNode('form');
      const input = createNode('input');
      input.setAttribute('type', 'email');
      input.setAttribute('required', 'true');
      input.setAttribute('placeholder', 'you@company.com');
      Object.assign(input.style, {
        width: '100%',
        height: '40px',
        padding: '0 12px',
        border: '1px solid #cbd5e1',
        borderRadius: '8px'
      });
      const button = createNode('button', campaign.button_text || 'Subscribe', {
        marginTop: '10px',
        width: '100%',
        height: '40px',
        border: 'none',
        borderRadius: '8px',
        background: '#2563eb',
        color: 'white',
        cursor: 'pointer'
      });
      button.setAttribute('type', 'submit');

      const close = createNode('button', 'Close', {
        marginTop: '8px',
        background: 'none',
        border: 'none',
        color: '#64748b',
        cursor: 'pointer'
      });
      close.setAttribute('type', 'button');

      form.appendChild(input);
      form.appendChild(button);
      card.appendChild(title);
      card.appendChild(subtitle);
      card.appendChild(form);
      card.appendChild(close);
      overlay.appendChild(card);
      document.body.appendChild(overlay);

      sendEvent({
        type: 'impression',
        siteId,
        campaignId: campaign.id,
        path: window.location.pathname,
        pageUrl: window.location.href
      });

      close.addEventListener('click', () => overlay.remove());

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = input.value;
        if (!email) return;

        await sendEvent({
          type: 'lead',
          siteId,
          campaignId: campaign.id,
          email,
          path: window.location.pathname,
          pageUrl: window.location.href
        });

        const success = createNode('div', campaign.success_message || 'Thanks for subscribing!', {
          padding: '8px 0',
          color: '#16a34a'
        });
        form.replaceWith(success);
      });
    };

    if (delay > 0) setTimeout(show, delay);

    if (scrollPercent > 0) {
      const onScroll = () => {
        const maxScrollable = document.body.scrollHeight - window.innerHeight;
        if (maxScrollable <= 0) return;
        const scrolled = (window.scrollY / maxScrollable) * 100;
        if (scrolled >= scrollPercent) {
          show();
          window.removeEventListener('scroll', onScroll);
        }
      };
      window.addEventListener('scroll', onScroll);
    }

    if (useExitIntent) {
      const onLeave = (event) => {
        if (event.clientY <= 0) {
          show();
          document.removeEventListener('mouseout', onLeave);
        }
      };
      document.addEventListener('mouseout', onLeave);
    }

    if (delay === 0 && scrollPercent === 0 && !useExitIntent) show();
  };

  const query = new URLSearchParams({
    siteId,
    url: window.location.href
  });

  fetch(apiOrigin + '/api/widget/config?' + query.toString())
    .then((res) => res.json())
    .then((data) => (data.campaigns || []).forEach(showCampaign))
    .catch(() => {});
})();`;

export async function GET() {
  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=60"
    }
  });
}
