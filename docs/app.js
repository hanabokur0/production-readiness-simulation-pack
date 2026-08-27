const sample = {
  app: { id: "demo-saas", stage: "poc" },
  auth: { enabled: true, token_expiry_tested: true, logout_invalidation_tested: false, refresh_failure_tested: true },
  authorization: { roles_defined: true, cross_user_access_tested: true, privilege_escalation_tested: true },
  failure: { db_timeout_handled: true, external_api_timeout_handled: false, rate_limit_handled: true },
  observability: { error_alert_tested: true, latency_alert_tested: false, alert_delivery_verified: false },
  security: { secrets_scanned: true, input_validation_tested: true, dependency_scan_current: true },
  billing: { enabled: true, duplicate_webhook_tested: false, payment_failure_tested: true, cancellation_race_tested: false },
  support: { route_defined: true, deletion_request_runbook: false },
  migration: { rollback_tested: false, duplicate_handling_tested: true, partial_failure_recovery_tested: false },
  sla: { target_defined: true, error_budget_defined: false },
  load: { load_test_rps: 120, burst_tested: true, capacity_limit_known: false },
  legal: { privacy_policy_present: true, consent_recorded: false }
};

const rules = [
  ['AUTH-001','auth','Expired token rejected','auth.token_expiry_tested','HOLD',true],
  ['AUTH-002','auth','Logout invalidates session','auth.logout_invalidation_tested','HOLD',true],
  ['AUTH-003','auth','Refresh failure recovery','auth.refresh_failure_tested','HOLD',true],
  ['AUTHZ-001','authorization','Cross-user access denied','authorization.cross_user_access_tested','REJECT'],
  ['AUTHZ-002','authorization','Privilege escalation denied','authorization.privilege_escalation_tested','REJECT'],
  ['AUTHZ-003','authorization','Roles explicitly defined','authorization.roles_defined','HOLD'],
  ['FAIL-001','failure','DB timeout handled','failure.db_timeout_handled','HOLD'],
  ['FAIL-002','failure','External API timeout handled','failure.external_api_timeout_handled','HOLD'],
  ['FAIL-003','failure','Rate limit handled','failure.rate_limit_handled','HOLD'],
  ['OBS-001','observability','Error alert verified','observability.error_alert_tested','HOLD'],
  ['OBS-002','observability','Latency alert verified','observability.latency_alert_tested','HOLD'],
  ['OBS-003','observability','Alert delivery verified','observability.alert_delivery_verified','HOLD'],
  ['SEC-001','security','Secrets scanned','security.secrets_scanned','REJECT'],
  ['SEC-002','security','Input validation tested','security.input_validation_tested','REJECT'],
  ['SEC-003','security','Dependency scan current','security.dependency_scan_current','HOLD'],
  ['BILL-001','billing','Duplicate webhook idempotent','billing.duplicate_webhook_tested','HOLD','billing'],
  ['BILL-002','billing','Payment failure transition','billing.payment_failure_tested','HOLD','billing'],
  ['BILL-003','billing','Cancel/renew race tested','billing.cancellation_race_tested','HOLD','billing'],
  ['SUP-001','support','Support route defined','support.route_defined','HOLD'],
  ['SUP-002','support','Deletion runbook tested','support.deletion_request_runbook','HOLD'],
  ['MIG-001','migration','Rollback tested','migration.rollback_tested','HOLD'],
  ['MIG-002','migration','Duplicate handling tested','migration.duplicate_handling_tested','HOLD'],
  ['MIG-003','migration','Partial failure recovery','migration.partial_failure_recovery_tested','HOLD'],
  ['SLA-001','sla','Service target defined','sla.target_defined','REVIEW'],
  ['SLA-002','sla','Error budget defined','sla.error_budget_defined','REVIEW'],
  ['LOAD-001','load','Load test >= 100 rps','load.load_test_rps','HOLD','gte100'],
  ['LOAD-002','load','Burst tested','load.burst_tested','HOLD'],
  ['LOAD-003','load','Capacity limit known','load.capacity_limit_known','REVIEW'],
  ['LEGAL-001','legal','Privacy policy verified','legal.privacy_policy_present','REVIEW'],
  ['LEGAL-002','legal','Consent recording verified','legal.consent_recorded','REVIEW']
];

const get=(o,p)=>p.split('.').reduce((a,k)=>a?.[k],o);
const textarea=document.querySelector('#manifest');
textarea.value=JSON.stringify(sample,null,2);

function run(){
  let m;
  try { m=JSON.parse(textarea.value); }
  catch(e){ alert('Manifest must be valid JSON in this browser demo. The CLI accepts YAML.'); return; }
  const out=[];
  for(const [id,domain,title,path,fail,mode] of rules){
    if(mode==='billing' && !m.billing?.enabled){out.push({id,domain,title,status:'SKIP'});continue;}
    if(mode===true && !m.auth?.enabled){out.push({id,domain,title,status:'SKIP'});continue;}
    const v=get(m,path);
    const pass=mode==='gte100' ? Number(v)>=100 : v===true;
    out.push({id,domain,title,status:pass?'PASS':fail});
  }
  const active=out.filter(x=>x.status!=='SKIP');
  const gate=active.some(x=>x.status==='REJECT')?'REJECT':active.some(x=>x.status==='HOLD')?'HOLD':active.some(x=>x.status==='REVIEW')?'REVIEW':'PASS';
  const count={PASS:0,REVIEW:0,HOLD:0,REJECT:0,SKIP:0};out.forEach(x=>count[x.status]++);
  document.querySelector('#gate').textContent=gate;
  document.querySelector('#gate').dataset.gate=gate;
  document.querySelector('#summary').innerHTML=Object.entries(count).map(([k,v])=>`<span>${k} <b>${v}</b></span>`).join('');
  document.querySelector('#results').innerHTML=out.filter(x=>x.status!=='PASS'&&x.status!=='SKIP').map(x=>`<article><div><small>${x.id} · ${x.domain}</small><h3>${x.title}</h3></div><strong data-status="${x.status}">${x.status}</strong></article>`).join('') || '<p>No unresolved findings.</p>';
}
document.querySelector('#run').addEventListener('click',run);run();
