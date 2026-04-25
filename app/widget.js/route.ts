import { NextResponse } from "next/server";

const script = `(() => {
  const scriptTag = document.currentScript;
  if (!scriptTag) return;
  const siteId = scriptTag.getAttribute("data-site-id");
  if (!siteId) return;

  const key = (campaignId) => `optin_seen_${campaignId}`;

  const sendEvent = async (payload) => {
    await fetch('/api/widget/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
  };

  const renderCampaign = (campaign) => {
    const rules = campaign.display_rules || {};
    const delay = Number(rules.delaySeconds || 0) * 1000;
    const scrollPercent = Number(rules.scrollPercent || 0);
    const useExitIntent = Boolean(rules.exitIntent);
    const frequencyHours = Number(rules.frequencyHours || 24);

    const alreadyShown = localStorage.getItem(key(campaign.id));
    if (alreadyShown && Date.now() - Number(alreadyShown) < frequencyHours * 3600000) return;

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      localStorage.setItem(key(campaign.id), String(Date.now()));

      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <div style="position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;padding:16px;">
          <div style="background:#fff;max-width:420px;width:100%;border-radius:12px;padding:20px;font-family:system-ui;">
            <h3 style="margin:0 0 6px;font-size:24px;">${campaign.headline}</h3>
            <p style="margin:0 0 12px;color:#475569;">${campaign.subheadline}</p>
            <form id="optin-form">
              <input type="email" required placeholder="you@company.com" style="width:100%;height:40px;padding:0 12px;border:1px solid #cbd5e1;border-radius:8px;" />
              <button style="margin-top:10px;width:100%;height:40px;border:none;border-radius:8px;background:#2563eb;color:white;cursor:pointer;">${campaign.button_text}</button>
            </form>
            <button id="optin-close" style="margin-top:8px;background:none;border:none;color:#64748b;cursor:pointer;">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(wrapper);
      sendEvent({ type: 'impression', siteId, campaignId: campaign.id, path: location.pathname });

      wrapper.querySelector('#optin-close')?.addEventListener('click', () => wrapper.remove());
      wrapper.querySelector('#optin-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input').value;
        await sendEvent({ type: 'lead', siteId, campaignId: campaign.id, email, path: location.pathname });
        e.target.outerHTML = `<div style="padding:8px 0;color:#16a34a;">${campaign.success_message}</div>`;
      });
    };

    if (delay > 0) setTimeout(show, delay);
    if (scrollPercent > 0) {
      const onScroll = () => {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
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

  fetch(`/api/widget/config?siteId=${siteId}&url=${encodeURIComponent(location.pathname)}`)
    .then((res) => res.json())
    .then((data) => (data.campaigns || []).forEach(renderCampaign));
})();`;

export async function GET() {
  return new NextResponse(script, {
    headers: { "Content-Type": "application/javascript; charset=utf-8" }
  });
}
