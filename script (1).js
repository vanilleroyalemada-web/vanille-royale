const products = [
  {
    slug:"vanille-de-sambava", category:"vanille", badge:"Vanille",
    name:"Vanille de Sambava – Madagascar",
    desc:"Des gousses souples, charnues et intensément parfumées.",
    details:"Originaire de la région de Sambava, cette vanille développe des notes chaudes, suaves, boisées et gourmandes. Elle sublime les crèmes, gâteaux, glaces, compotes, confitures et rhums arrangés.",
    formats:[["1 gousse",4],["2 gousses",8],["3 gousses",12],["4 gousses",16]],
    promo:"À partir de 5 gousses achetées : 1 gousse offerte.",
    art:"vanilla"
  },
  {
    slug:"poivre-sauvage", category:"poivre", badge:"Poivre entier",
    name:"Poivre sauvage de Madagascar (voatsiperifery)",
    desc:"Un poivre rare aux notes boisées, fraîches et légèrement citronnées.",
    details:"À moudre au dernier moment et à ajouter de préférence en fin de cuisson. Il accompagne les viandes, poissons, légumes, sauces et certains desserts au chocolat.",
    formats:[["25 g",5.50],["50 g",11],["100 g",22],["250 g",55]],
    promo:"Tarif de référence : 220 € le kilogramme.",
    art:"wildpepper"
  },
  {
    slug:"poivre-noir-moulu", category:"poivre", badge:"Poivre moulu",
    name:"Poivre noir moulu de Madagascar",
    desc:"Un poivre intense, boisé et légèrement fruité, prêt à l’emploi.",
    details:"Élaboré à partir de grains soigneusement sélectionnés puis moulus. Ajoutez-le en fin de cuisson afin de conserver toute l’intensité de ses arômes.",
    formats:[["25 g",null],["50 g",null],["100 g",null]],
    promo:"Tarifs à finaliser — contactez-nous.",
    art:"groundpepper"
  },
  {
    slug:"curcuma", category:"epice", badge:"Épice",
    name:"Curcuma de Madagascar",
    desc:"Une épice lumineuse aux notes chaudes et délicatement terreuses.",
    details:"Il apporte une belle couleur dorée et une saveur chaleureuse aux légumes, riz, sauces, soupes, marinades et plats mijotés.",
    formats:[["50 g",null],["100 g",null],["250 g",null]],
    promo:"Tarifs à finaliser — contactez-nous.",
    art:"turmeric"
  }
];

const art = {
 vanilla:`<svg viewBox="0 0 300 300" aria-hidden="true"><g fill="none" stroke-linecap="round"><path d="M92 258C121 181 137 105 159 32" stroke="#3c261d" stroke-width="18"/><path d="M137 270C169 194 181 117 208 47" stroke="#62432e" stroke-width="17"/><path d="M167 88c-45-22-72 13-53 43 20 30 57 1 53-43Z" fill="#fff9e8" stroke="#d8bd76" stroke-width="4"/><circle cx="145" cy="111" r="11" fill="#d4af37"/></g></svg>`,
 wildpepper:`<svg viewBox="0 0 300 300" aria-hidden="true"><g fill="none" stroke="#6c4d37" stroke-width="5" stroke-linecap="round"><path d="M58 240C122 170 168 110 230 52"/><path d="M102 190 63 125M133 155 105 88M165 122 151 61M185 102l45 16M145 144l47 24M100 190l45 35"/></g><g fill="#2b1e19">${[[63,125],[76,145],[88,163],[104,88],[114,108],[125,128],[151,61],[159,81],[169,101],[230,118],[211,132],[192,168],[176,160],[145,225],[126,214]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="10"/>`).join("")}</g><g fill="#526443"><ellipse cx="72" cy="109" rx="28" ry="11" transform="rotate(35 72 109)"/><ellipse cx="143" cy="48" rx="30" ry="11" transform="rotate(-20 143 48)"/><ellipse cx="227" cy="101" rx="28" ry="10" transform="rotate(20 227 101)"/></g></svg>`,
 groundpepper:`<svg viewBox="0 0 300 300" aria-hidden="true"><ellipse cx="150" cy="225" rx="93" ry="25" fill="#c6ab8c"/><path d="M74 214c14-85 138-86 152 0-45 22-107 22-152 0Z" fill="#49352a"/><g fill="#231814">${Array.from({length:45},(_,i)=>`<circle cx="${90+(i*37)%120}" cy="${160+(i*23)%55}" r="${2+(i%4)}"/>`).join("")}</g><path d="M82 211c43 18 92 20 137 0" fill="none" stroke="#f2e0c6" stroke-width="6"/></svg>`,
 turmeric:`<svg viewBox="0 0 300 300" aria-hidden="true"><ellipse cx="150" cy="230" rx="100" ry="27" fill="#c6ab8c"/><path d="M68 218c22-75 142-74 164 0-49 22-115 23-164 0Z" fill="#df941e"/><g fill="#f3b337">${Array.from({length:28},(_,i)=>`<circle cx="${90+(i*43)%125}" cy="${168+(i*19)%52}" r="${3+(i%5)}"/>`).join("")}</g><path d="M98 126c-5-40 20-72 45-82 4 38-12 69-45 82Z" fill="#536743"/><path d="M151 125c10-43 42-63 70-63-9 39-33 62-70 63Z" fill="#71815a"/></svg>`
};

const euro = n => new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(n);
let cart = JSON.parse(localStorage.getItem("vr_cart") || "[]");

function lowestPrice(p){ const prices=p.formats.map(f=>f[1]).filter(v=>v!==null); return prices.length?`À partir de ${euro(Math.min(...prices))}`:"Prix sur demande"; }
function renderProducts(filter="all"){
  const grid=document.querySelector("#productGrid");
  grid.innerHTML=products.filter(p=>filter==="all"||p.category===filter).map(p=>`
    <article class="product-card">
      <div class="product-image"><span class="product-badge">${p.badge}</span>${art[p.art]}</div>
      <div class="product-body"><h3>${p.name}</h3><p>${p.desc}</p><div class="price">${lowestPrice(p)}</div>
      <div class="card-actions"><button class="btn btn-outline details-btn" data-slug="${p.slug}">Découvrir</button>
      <button class="btn btn-primary quick-add" data-slug="${p.slug}" ${p.formats[0][1]===null?"disabled":""}>Ajouter</button></div></div>
    </article>`).join("");
}
function saveCart(){localStorage.setItem("vr_cart",JSON.stringify(cart));renderCart()}
function addToCart(slug,label,price){
  const p=products.find(x=>x.slug===slug); if(price===null){location.href="mailto:vanilleroyalemada@gmail.com?subject=Demande%20de%20prix";return}
  const key=`${slug}__${label}`, found=cart.find(i=>i.key===key);
  if(found) found.qty++; else cart.push({key,slug,name:p.name,label,price,qty:1});
  saveCart(); toast("Produit ajouté au panier");
}
function renderCart(){
  document.querySelector("#cartCount").textContent=cart.reduce((s,i)=>s+i.qty,0);
  document.querySelector("#cartItems").innerHTML=cart.length?cart.map(i=>`<div class="cart-item"><div><strong>${i.name}</strong><p>${i.label} — ${euro(i.price)}</p><button class="text-btn remove" data-remove="${i.key}">Retirer</button></div><div class="qty"><button data-minus="${i.key}">−</button><span>${i.qty}</span><button data-plus="${i.key}">+</button></div></div>`).join(""):"<p>Votre panier est vide.</p>";
  document.querySelector("#cartTotal").textContent=euro(cart.reduce((s,i)=>s+i.price*i.qty,0));
}
function openProduct(slug){
  const p=products.find(x=>x.slug===slug), modal=document.querySelector("#productModal");
  document.querySelector("#modalContent").innerHTML=`<div class="modal-inner"><div class="modal-art">${art[p.art]}</div><div class="modal-copy"><p class="eyebrow">${p.badge}</p><h2>${p.name}</h2><p>${p.details}</p><p><strong>${p.promo}</strong></p><label>Choisir un format<select id="modalFormat">${p.formats.map((f,i)=>`<option value="${i}">${f[0]} — ${f[1]===null?"prix sur demande":euro(f[1])}</option>`).join("")}</select></label><button class="btn btn-primary full" id="modalAdd">${p.formats[0][1]===null?"Demander le prix":"Ajouter au panier"}</button></div></div>`;
  modal.showModal();
  document.querySelector("#modalAdd").onclick=()=>{const f=p.formats[+document.querySelector("#modalFormat").value];addToCart(p.slug,f[0],f[1]);modal.close()}
}
function toast(msg){const t=document.querySelector("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function openCart(){document.querySelector("#cartPanel").classList.add("open");document.querySelector("#overlay").classList.add("show");document.querySelector("#cartPanel").setAttribute("aria-hidden","false")}
function closeCart(){document.querySelector("#cartPanel").classList.remove("open");document.querySelector("#overlay").classList.remove("show");document.querySelector("#cartPanel").setAttribute("aria-hidden","true")}
const legalPages={
 mentions:`<h2>Mentions légales</h2><p>Éditeur : VANILLE ROYALE.</p><p>Adresse, statut juridique, numéro SIRET, responsable de publication et hébergeur : <strong>à compléter avant mise en ligne commerciale.</strong></p><p>Contact : vanilleroyalemada@gmail.com</p>`,
 cgv:`<h2>Conditions générales de vente</h2><p>Ce modèle doit être complété et validé avant l’ouverture des paiements en ligne.</p><h3>Produits et prix</h3><p>Les caractéristiques essentielles et prix TTC sont indiqués sur chaque fiche. Les frais de livraison sont communiqués avant validation définitive de la commande.</p><h3>Commandes</h3><p>Dans cette version, les demandes de commande sont transmises par e-mail et ne constituent pas un paiement automatique.</p><h3>Rétractation et retours</h3><p>Les modalités applicables, exclusions éventuelles pour les denrées alimentaires, adresse de retour et procédure doivent être précisées par la vendeuse.</p>`,
 confidentialite:`<h2>Politique de confidentialité</h2><p>Les informations transmises par le formulaire servent uniquement à répondre aux demandes et à préparer les commandes.</p><p>Responsable de traitement, durée de conservation, droits d’accès, de rectification, d’effacement et coordonnées de contact : à compléter conformément au RGPD.</p>`
};
document.addEventListener("click",e=>{
  const d=e.target.closest(".details-btn"), q=e.target.closest(".quick-add");
  if(d) openProduct(d.dataset.slug);
  if(q){const p=products.find(x=>x.slug===q.dataset.slug),f=p.formats[0];addToCart(p.slug,f[0],f[1])}
  if(e.target.dataset.plus){const i=cart.find(x=>x.key===e.target.dataset.plus);i.qty++;saveCart()}
  if(e.target.dataset.minus){const i=cart.find(x=>x.key===e.target.dataset.minus);i.qty=Math.max(1,i.qty-1);saveCart()}
  if(e.target.dataset.remove){cart=cart.filter(x=>x.key!==e.target.dataset.remove);saveCart()}
  const legal=e.target.closest(".legal-link");if(legal){document.querySelector("#legalContent").innerHTML=legalPages[legal.dataset.page];document.querySelector("#legalModal").showModal()}
});
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderProducts(b.dataset.filter)});
document.querySelectorAll(".modal-close").forEach(b=>b.onclick=()=>b.closest("dialog").close());
document.querySelector("#openCart").onclick=openCart;document.querySelector("#closeCart").onclick=closeCart;document.querySelector("#overlay").onclick=closeCart;
document.querySelector("#clearCart").onclick=()=>{cart=[];saveCart()};
document.querySelector("#orderByEmail").onclick=()=>{
 if(!cart.length)return toast("Votre panier est vide");
 const lines=cart.map(i=>`- ${i.name} — ${i.label} x ${i.qty} : ${euro(i.price*i.qty)}`).join("\n");
 const total=euro(cart.reduce((s,i)=>s+i.price*i.qty,0));
 location.href=`mailto:vanilleroyalemada@gmail.com?subject=${encodeURIComponent("Commande Vanille Royale")}&body=${encodeURIComponent("Bonjour,\n\nJe souhaite commander :\n"+lines+"\n\nSous-total : "+total+"\n\nNom :\nAdresse de livraison :\nTéléphone :\n\nMerci.")}`;
};
document.querySelector("#contactForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);location.href=`mailto:vanilleroyalemada@gmail.com?subject=${encodeURIComponent(f.get("subject"))}&body=${encodeURIComponent("Nom : "+f.get("name")+"\nE-mail : "+f.get("email")+"\n\n"+f.get("message"))}`};
document.querySelector("#newsletterForm").onsubmit=e=>{e.preventDefault();toast("Merci ! L’inscription sera activée avec votre futur outil d’e-mailing.");e.target.reset()};
document.querySelector(".menu-btn").onclick=e=>{const nav=document.querySelector(".main-nav");nav.classList.toggle("open");e.currentTarget.setAttribute("aria-expanded",nav.classList.contains("open"))};
document.querySelectorAll(".main-nav a").forEach(a=>a.onclick=()=>document.querySelector(".main-nav").classList.remove("open"));
document.querySelector("#backToTop").onclick=()=>scrollTo({top:0,behavior:"smooth"});
window.addEventListener("scroll",()=>document.querySelector("#backToTop").style.display=scrollY>600?"block":"none");
document.querySelector("#year").textContent=new Date().getFullYear();
renderProducts();renderCart();