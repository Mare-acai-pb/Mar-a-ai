import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY, WHATSAPP_NUMBER } from './config.js';
const configured = SUPABASE_URL.startsWith('https://') && !SUPABASE_URL.includes('SEU-PROJETO') && SUPABASE_ANON_KEY.length > 30 && !SUPABASE_ANON_KEY.includes('SUA_CHAVE');
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
const $ = id => document.getElementById(id);
const prices = {P:12,M:15,G:18}, volumes = {P:'500 ml',M:'750 ml',G:'1,5 kg'};
const extras = ['Banana','Leite em pó','Leite condensado','Granola','Paçoca','Morango','Confete'];
let selectedSize='P', selectedExtras=[], session=null, profile=null;
const brl = n => n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const phoneE164 = raw => { const digits=raw.replace(/\D/g,''); return '+'+(digits.startsWith('55')?digits:'55'+digits); };
const ingredientImages = {
  'Banana':'banana.svg',
  'Leite em pó':'leite-em-po.svg',
  'Leite condensado':'leite-condensado.svg',
  'Granola':'granola.svg',
  'Paçoca':'pacoca.svg',
  'Morango':'morango.svg',
  'Confete':'confete.svg'
};
function renderExtras(){
  $('extras').innerHTML=extras.map(x=>`<label class="extra">
    <img class="ingredient-photo" src="assets/${ingredientImages[x]}" alt="${x}">
    <span>${x}</span>
    <input type="checkbox" value="${x}" ${selectedExtras.includes(x)?'checked':''} aria-label="Adicionar ${x}">
  </label>`).join('');
  $('extras').querySelectorAll('input').forEach(input=>input.addEventListener('change',e=>{
    if(e.target.checked&&selectedExtras.length>=7){e.target.checked=false;return;}
    selectedExtras=e.target.checked?[...selectedExtras,e.target.value]:selectedExtras.filter(x=>x!==e.target.value);
    updateTotal();
  }));
}
function updateTotal(){const nut=$('nutella').checked;const total=prices[selectedSize]+(nut?1.5:0);$('extraCount').textContent=`${selectedExtras.length}/7 grátis`;$('summarySize').textContent=`Açaí ${selectedSize} • ${volumes[selectedSize]}`;$('basePrice').textContent=brl(prices[selectedSize]);$('nutellaPrice').textContent=brl(nut?1.5:0);$('total').textContent=brl(total);}
function fulfillment(){const val=document.querySelector('input[name="fulfillment"]:checked').value;document.querySelectorAll('.delivery-field').forEach(el=>el.classList.toggle('hidden',val!=='Delivery'));}
document.querySelectorAll('.size-card').forEach(btn=>btn.addEventListener('click',()=>{selectedSize=btn.dataset.size;document.querySelectorAll('.size-card').forEach(x=>x.classList.toggle('selected',x===btn));updateTotal();}));
renderExtras();updateTotal();$('nutella').addEventListener('change',updateTotal);document.querySelectorAll('input[name="fulfillment"]').forEach(x=>x.addEventListener('change',fulfillment));fulfillment();
$('copyPix').addEventListener('click',async()=>{await navigator.clipboard.writeText('83994037816');$('copyPix').textContent='Copiado!';});
$('placeOrder').addEventListener('click',async()=>{const name=$('customerName').value.trim(),phone=$('customerPhone').value.replace(/\D/g,''),mode=document.querySelector('input[name="fulfillment"]:checked').value,address=$('address').value.trim();if(!name||phone.length<10||(mode==='Delivery'&&!address)){ $('orderMessage').textContent='Preencha nome, telefone e endereço (para delivery).';return;}if(supabase&&!session){$('orderMessage').textContent='Para registrar seu pedido e marcar o cartão automaticamente, entre primeiro pelo botão do Clube Maré e confirme o código SMS.';$('loyaltyLogin').scrollIntoView({behavior:'smooth',block:'center'});return;}
 const topping=document.querySelector('input[name="topping"]:checked')?.value||'Sem cobertura';\n  const order={customer_name:name,customer_phone:phone,fulfillment:mode,address:mode==='Delivery'?address:null,reference:mode==='Delivery'?$('reference').value.trim():null,payment_method:$('payment').value,size:selectedSize,volume:volumes[selectedSize],extras:selectedExtras,topping,nutella:$('nutella').checked,subtotal:prices[selectedSize]+($('nutella').checked?1.5:0),status:'pending'};
 let saved=false,orderId='';if(supabase&&session){const {data,error}=await supabase.from('orders').insert({customer_id:session.user.id,...order}).select('id').single();if(!error){saved=true;orderId=data.id;}else{$('orderMessage').textContent='Não foi possível registrar no sistema. O pedido será enviado pelo WhatsApp.';}}
 const msg=`🌊 *MARÉ AÇAÍ — PEDIDO*\nCliente: ${name}\nTelefone: ${phone}\nRecebimento: ${mode}\n${mode==='Delivery'?`Endereço: ${address}\nReferência: ${order.reference||'Não informada'}\n`:''}Tamanho: ${selectedSize} (${volumes[selectedSize]})\nAdicionais: ${selectedExtras.join(', ')||'Nenhum'}\nNutella: ${order.nutella?'Sim (+ R$ 1,50)':'Não'}\nPagamento: ${order.payment_method}\nSubtotal: ${brl(order.subtotal)}\nEntrega: a confirmar\n${saved?`Código do pedido: ${orderId}`:'Pedido para cadastro manual'}\n\nAguardando confirmação da loja.`;
 window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,'_blank');$('orderMessage').textContent=saved?'Pedido registrado! A loja confirmará pelo WhatsApp.':'WhatsApp aberto. A loja precisa registrar o pedido no painel.';
});
$('loyaltyLogin').addEventListener('click',async()=>{if(!supabase){$('loyaltyArea').innerHTML='<p>O cartão automático será ativado depois de conectar o projeto Supabase e configurar o acesso por telefone.</p>';return;}const phone=$('customerPhone').value.replace(/\D/g,'');if(phone.length<10){$('loyaltyArea').innerHTML='<p>Digite seu telefone com DDD no campo acima e tente novamente.</p>';return;}const {error}=await supabase.auth.signInWithOtp({phone:phoneE164(phone)});$('loyaltyArea').innerHTML=error?`<p>Não foi possível enviar o código: ${error.message}</p>`:'<p>Enviamos um código SMS. Digite-o abaixo para entrar no cartão.</p><input id="otp" placeholder="Código recebido"><button class="secondary" id="verifyOtp">Confirmar código</button>';if(!error)$('verifyOtp').addEventListener('click',verifyOtp);});
async function verifyOtp(){const phone=$('customerPhone').value.replace(/\D/g,''),token=$('otp').value.trim();const {data,error}=await supabase.auth.verifyOtp({phone:phoneE164(phone),token,type:'sms'});if(error){$('loyaltyArea').textContent='Código inválido ou expirado.';return;}session=data.session;await loadProfile();await showLoyalty();}
async function loadProfile(){if(!session)return;const {data}=await supabase.from('profiles').select('*').eq('id',session.user.id).single();profile=data;}
async function showLoyalty(){if(!profile)await loadProfile();if(!profile){$('loyaltyArea').textContent='Seu cartão ainda está sendo criado. Atualize em instantes.';return;}const {data:rewards}=await supabase.from('loyalty_rewards').select('*').eq('customer_id',session.user.id).eq('redeemed',false);const stamps=profile.completed_orders%10;$('loyaltyArea').innerHTML=`<div class="order-card"><b>Cartão de ${profile.name||'Cliente Maré'}</b><p>${stamps} de 10 carimbos neste ciclo</p><p>${'● '.repeat(stamps)}${'○ '.repeat(10-stamps)}</p><p>Pedidos concluídos no total: ${profile.completed_orders}</p><p>Recompensas disponíveis: ${(rewards||[]).map(r=>r.reward_type==='discount5'?'R$ 5 de desconto':'Açaí P grátis').join(', ')||'Nenhuma no momento'}</p></div>`;}
async function init(){if(!supabase)return;const {data}=await supabase.auth.getSession();session=data.session;if(session){await loadProfile();await showLoyalty();if(profile?.is_admin)loadAdmin();}supabase.auth.onAuthStateChange(async(_event,s)=>{session=s;if(session){await loadProfile();await showLoyalty();if(profile?.is_admin)loadAdmin();}});}
async function loadAdmin(){ $('adminPanel').classList.remove('hidden');const {data,error}=await supabase.from('orders').select('*').order('created_at',{ascending:false}).limit(50);if(error){$('ordersList').textContent='Não foi possível carregar os pedidos.';return;}$('ordersList').innerHTML=(data||[]).map(o=>`<div class="order-card"><b>${o.customer_name} — ${o.size} (${o.volume})</b><p>${o.customer_phone} • ${o.fulfillment} • ${brl(o.subtotal)}</p><p>${o.address||'Retirada'} • ${o.status}</p><button data-id="${o.id}" data-status="completed">Marcar como concluído e carimbar</button></div>`).join('')||'Nenhum pedido ainda.';$('ordersList').querySelectorAll('button').forEach(b=>b.addEventListener('click',async()=>{const {error}=await supabase.from('orders').update({status:'completed'}).eq('id',b.dataset.id);if(error)alert('Não foi possível atualizar: '+error.message);else loadAdmin();}));}
init();

document.querySelectorAll('input[name="topping"]').forEach(input=>input.addEventListener('change',()=>{
  document.querySelectorAll('.topping-card').forEach(card=>card.classList.toggle('selected',card.querySelector('input').checked));
}));
