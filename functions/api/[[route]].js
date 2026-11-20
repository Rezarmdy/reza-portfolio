const SITE = 'https://rezaromadoni.pages.dev';
const REPOSITORY = 'Rezarmdy/reza-portfolio';
const REPOSITORY_ID = '1465606674';
const COOKIE = '__Host-reza-cms-oauth';
const BASE_HEADERS = {
  'Cache-Control':'no-store', 'Referrer-Policy':'no-referrer',
  'X-Content-Type-Options':'nosniff', 'X-Frame-Options':'DENY'
};
function encode(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function decode(value) {
  const base = value.replace(/-/g,'+').replace(/_/g,'/');
  return atob(base.padEnd(Math.ceil(base.length/4)*4,'='));
}
function random() { return encode(crypto.getRandomValues(new Uint8Array(32))); }
function cookie(value, maxAge=600) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
function readSession(request) {
  const parts = (request.headers.get('Cookie') || '').split(';');
  const raw = parts.map(p=>p.trim()).find(p=>p.startsWith(COOKIE+'='));
  try { return JSON.parse(decode(raw?.slice(COOKIE.length+1) || '')); } catch { return null; }
}
function matches(a,b) {
  if (typeof a!=='string'||typeof b!=='string'||a.length!==b.length||a.length!==43) return false;
  let n=0; for(let i=0;i<a.length;i++) n|=a.charCodeAt(i)^b.charCodeAt(i);
  return n===0;
}
function html(message,status=400) {
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reza / Admin login</title><style>body{background:#d7ebfc;color:#10161f;font:17px/1.65 Arial,sans-serif;display:grid;place-content:center;min-height:90vh;padding:24px}main{max-width:550px}a{color:#245b86}h1{letter-spacing:-1px}</style><main><h1>Admin login</h1><p>${message}</p><a href="${SITE}/admin/">Return to the editor</a></main></html>`,{status,headers:{...BASE_HEADERS,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",'Set-Cookie':cookie('',0)}});
}
function popup(token) {
  const nonce = random();
  const payload = JSON.stringify('authorization:github:success:'+JSON.stringify({token,provider:'github'})).replace(/</g,'\\u003c');
  const body = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>Reza / Signed in</title><p>Signing you into the editor…</p><script nonce="${nonce}">
const origin=${JSON.stringify(SITE)};
if(window.opener){
 const receive=(event)=>{
  if(event.origin!==origin||event.source!==window.opener||event.data!=='authorizing:github')return;
  window.removeEventListener('message',receive);
  window.opener.postMessage(${payload},origin);
  setTimeout(()=>window.close(),300);
 };
 window.addEventListener('message',receive);
 window.opener.postMessage('authorizing:github',origin);
}else{document.querySelector('p').textContent='Open the editor and choose Login with GitHub to continue.';}
</script></html>`;
  return new Response(body,{headers:{...BASE_HEADERS,'Content-Type':'text/html; charset=utf-8','Set-Cookie':cookie('',0),'Content-Security-Policy':`default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'`}});
}
export async function onRequest(context) {
  const {request,env}=context;
  const url = new URL(request.url);
  if(request.method!=='GET')return new Response('Method not allowed',{status:405,headers:{...BASE_HEADERS,Allow:'GET'}});
  const configured=Boolean(env.GITHUB_CLIENT_ID&&env.GITHUB_CLIENT_SECRET);
  if(url.pathname==='/api/status')return Response.json({configured,repository:REPOSITORY},{headers:BASE_HEADERS});
  if(url.origin!==SITE)return html('Please sign in from the published website.',403);
  if(!['/api/auth','/api/callback'].includes(url.pathname))return new Response('Not found',{status:404,headers:BASE_HEADERS});
  if(!configured)return html('Admin login has not been connected yet. Your public website is available. Complete the one-time GitHub connection to enable editing.',503);
  if(url.pathname==='/api/auth'){
    const state=random(),verifier=random();
    const challenge=encode(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
    const session=encode(new TextEncoder().encode(JSON.stringify({state,verifier,created:Date.now()})));
    const target=new URL('https://github.com/login/oauth/authorize');
    target.searchParams.set('client_id',env.GITHUB_CLIENT_ID);
    target.searchParams.set('redirect_uri',SITE+'/api/callback');
    target.searchParams.set('state',state);
    target.searchParams.set('code_challenge',challenge);
    target.searchParams.set('code_challenge_method','S256');
    target.searchParams.set('login','Rezarmdy');target.searchParams.set('allow_signup','false');
    // GitHub App permissions are configured on the app, never widened with OAuth repo scopes.
    return new Response(null,{status:302,headers:{...BASE_HEADERS,Location:target.toString(),'Set-Cookie':cookie(session)}});
  }
  const session=readSession(request),state=url.searchParams.get('state'),code=url.searchParams.get('code');
  if(!session||!matches(state,session.state)||!matches(session.verifier,session.verifier)||!Number.isFinite(session.created)||Date.now()-session.created>600000||session.created>Date.now()+1000||!code||code.length>512){
    return html('This sign-in link expired or could not be verified. Please start again from the editor.',400);
  }
  try{
    const exchange=await fetch('https://github.com/login/oauth/access_token',{
      method:'POST',redirect:'error',headers:{Accept:'application/json','Content-Type':'application/json'},
      body:JSON.stringify({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code,redirect_uri:SITE+'/api/callback',code_verifier:session.verifier,repository_id:REPOSITORY_ID})
    });
    if(!exchange.ok)return html('GitHub could not complete the sign-in. Please try again.',502);
    const result=await exchange.json();
    if(typeof result.access_token!=='string'||!result.access_token.startsWith('ghu_'))return html('The website editor requires its dedicated GitHub App connection.',403);
    const headers={Accept:'application/vnd.github+json',Authorization:'Bearer '+result.access_token,'User-Agent':'Reza-Portfolio-Admin','X-GitHub-Api-Version':'2022-11-28'};
    const identity=await fetch('https://api.github.com/user',{headers,redirect:'error'});
    if(!identity.ok)return html('Your GitHub identity could not be verified.',403);
    const user=await identity.json();
    const allowed=(env.ALLOWED_GITHUB_USERS||'Rezarmdy').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
    if(!allowed.includes(String(user.login).toLowerCase()))return html('This GitHub account is not authorised to edit this website.',403);
    const repo=await fetch('https://api.github.com/repos/'+REPOSITORY,{headers,redirect:'error'});
    if(!repo.ok)return html('Install the website editor GitHub App on the portfolio repository, then sign in again.',403);
    const access=await repo.json();
    if(String(access.id)!==REPOSITORY_ID||!access.permissions?.push)return html('This account does not have permission to publish portfolio changes.',403);
    return popup(result.access_token);
  }catch{return html('The sign-in service is temporarily unavailable. Please try again.',502);}
}
